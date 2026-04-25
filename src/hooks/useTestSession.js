import { useCallback, useEffect, useRef, useState } from 'react'
import { supabase } from '../lib/supabase'
import { useAuth } from '../context/AuthContext'

/**
 * useTestSession — persistent, resumable test progress backed by Supabase.
 *
 * USAGE (practice set):
 *   const session = useTestSession({
 *     kind: 'practice',
 *     section: 'reading',
 *     partId: 'R1',
 *     setNumber: 1,
 *     practiceSetId: null, // or UUID if you have it
 *     enabled: true,
 *   })
 *
 * USAGE (mock exam):
 *   const session = useTestSession({ kind: 'mock', examNumber: 42 })
 *
 * Returned API:
 *   session.id                   — UUID of active session (null until ready)
 *   session.loading              — true while bootstrapping
 *   session.answers              — { [key]: value } restored from cloud
 *   session.currentSection       — last persisted section
 *   session.currentPart          — last persisted part (mock)
 *   session.currentQuestionIndex — last persisted question idx
 *   session.completedSections    — string[]
 *   session.scores               — JSON object (per-part scores for mock)
 *   session.meta                 — free-form JSON
 *
 *   session.saveAnswer(key, value)         — autosave a single answer
 *   session.setAnswers(map)                — replace whole answers map
 *   session.setCurrentQuestionIndex(idx)
 *   session.setCurrentSection(sec)
 *   session.setCurrentPart(part)
 *   session.markSectionComplete(sec)
 *   session.setScores(partId, score)       — merge { [partId]: score }
 *   session.setMeta(patch)                 — shallow-merge meta JSON
 *   session.complete()                     — mark is_completed = true
 *   session.reset()                        — complete + start a fresh one
 */
export function useTestSession({
  kind = 'practice',
  section = null,
  partId = null,
  setNumber = null,
  practiceSetId = null,
  examNumber = null,
  enabled = true,
} = {}) {
  const { user } = useAuth()

  const [id, setId] = useState(null)
  const [loading, setLoading] = useState(true)
  const [answers, setAnswersState] = useState({})
  const [currentSection, setCurrentSectionState] = useState(section)
  const [currentPart, setCurrentPartState] = useState(partId)
  const [currentQuestionIndex, setCurrentQuestionIndexState] = useState(0)
  const [completedSections, setCompletedSectionsState] = useState([])
  const [scoresState, setScoresStateRaw] = useState({})
  const [metaState, setMetaStateRaw] = useState({})

  // Hold mutable copies so debounced saves see latest values.
  const stateRef = useRef({
    answers: {},
    currentSection: section,
    currentPart: partId,
    currentQuestionIndex: 0,
    completedSections: [],
    scores: {},
    meta: {},
  })

  const saveTimer = useRef(null)
  const idRef = useRef(null)
  const mounted = useRef(true)

  const clearLocalState = useCallback(() => {
    if (saveTimer.current) clearTimeout(saveTimer.current)
    idRef.current = null
    const next = {
      answers: {},
      currentSection: section,
      currentPart: partId,
      currentQuestionIndex: 0,
      completedSections: [],
      scores: {},
      meta: {},
    }
    stateRef.current = next
    setId(null)
    setAnswersState({})
    setCurrentSectionState(section)
    setCurrentPartState(partId)
    setCurrentQuestionIndexState(0)
    setCompletedSectionsState([])
    setScoresStateRaw({})
    setMetaStateRaw({})
  }, [section, partId])

  useEffect(() => () => {
    mounted.current = false
    if (saveTimer.current) clearTimeout(saveTimer.current)
  }, [])

  // ── Bootstrap: start or resume the session for the given context ───────────
  useEffect(() => {
    if (!enabled || !user?.id) {
      clearLocalState()
      setLoading(false)
      return
    }
    let cancelled = false
    setLoading(true)

    const run = async () => {
      try {
        let row = null
        if (kind === 'mock') {
          const { data, error } = await supabase.rpc('start_or_resume_mock_session', {
            p_exam_number: examNumber ?? 1,
          })
          if (error) throw error
          row = Array.isArray(data) ? data[0] : data
        } else {
          const { data, error } = await supabase.rpc('start_or_resume_practice_session', {
            p_section: section,
            p_part_id: partId,
            p_set_number: setNumber,
            p_practice_set_id: practiceSetId,
          })
          if (error) throw error
          row = Array.isArray(data) ? data[0] : data
        }

        if (cancelled || !row) return

        idRef.current = row.id
        const next = {
          answers: row.selected_answers || {},
          currentSection: row.current_section || section,
          currentPart: row.current_part || partId,
          currentQuestionIndex: row.current_question_index || 0,
          completedSections: row.completed_sections || [],
          scores: row.scores || {},
          meta: row.meta || {},
        }
        stateRef.current = next
        setId(row.id)
        setAnswersState(next.answers)
        setCurrentSectionState(next.currentSection)
        setCurrentPartState(next.currentPart)
        setCurrentQuestionIndexState(next.currentQuestionIndex)
        setCompletedSectionsState(next.completedSections)
        setScoresStateRaw(next.scores)
        setMetaStateRaw(next.meta)
      } catch (e) {
        // Silent fail — the page can still work in-memory; resume just won't work.
        console.warn('[useTestSession] bootstrap failed', e?.message || e)
      } finally {
        if (!cancelled && mounted.current) setLoading(false)
      }
    }
    run()
    return () => { cancelled = true }
  }, [enabled, user?.id, kind, section, partId, setNumber, practiceSetId, examNumber, clearLocalState])

  // ── Debounced cloud autosave ───────────────────────────────────────────────
  const flush = useCallback(async () => {
    const sid = idRef.current
    if (!sid) return
    const s = stateRef.current
    try {
      await supabase
        .from('test_sessions')
        .update({
          selected_answers: s.answers,
          current_section: s.currentSection,
          current_part: s.currentPart,
          current_question_index: s.currentQuestionIndex,
          completed_sections: s.completedSections,
          scores: s.scores,
          meta: s.meta,
        })
        .eq('id', sid)
    } catch (e) {
      console.warn('[useTestSession] save failed', e?.message || e)
    }
  }, [])

  const queueSave = useCallback((delay = 400) => {
    if (saveTimer.current) clearTimeout(saveTimer.current)
    saveTimer.current = setTimeout(() => { flush() }, delay)
  }, [flush])

  // Flush on tab close / route change
  useEffect(() => {
    const onBeforeUnload = () => {
      if (saveTimer.current) clearTimeout(saveTimer.current)
      // Best-effort sync flush
      flush()
    }
    window.addEventListener('beforeunload', onBeforeUnload)
    return () => {
      window.removeEventListener('beforeunload', onBeforeUnload)
      // Final flush on unmount
      if (saveTimer.current) {
        clearTimeout(saveTimer.current)
        flush()
      }
    }
  }, [flush])

  // ── Mutators ───────────────────────────────────────────────────────────────
  const saveAnswer = useCallback((key, value) => {
    const next = { ...stateRef.current.answers, [key]: value }
    stateRef.current.answers = next
    setAnswersState(next)
    queueSave()
  }, [queueSave])

  const setAnswers = useCallback((mapOrUpdater) => {
    const next = typeof mapOrUpdater === 'function'
      ? mapOrUpdater(stateRef.current.answers)
      : mapOrUpdater
    stateRef.current.answers = next || {}
    setAnswersState(next || {})
    queueSave()
  }, [queueSave])

  const setCurrentQuestionIndex = useCallback((idx) => {
    stateRef.current.currentQuestionIndex = idx
    setCurrentQuestionIndexState(idx)
    queueSave()
  }, [queueSave])

  const setCurrentSection = useCallback((sec) => {
    stateRef.current.currentSection = sec
    setCurrentSectionState(sec)
    queueSave(200)
  }, [queueSave])

  const setCurrentPart = useCallback((p) => {
    stateRef.current.currentPart = p
    setCurrentPartState(p)
    queueSave(200)
  }, [queueSave])

  const markSectionComplete = useCallback((sec) => {
    const list = stateRef.current.completedSections || []
    if (list.includes(sec)) return
    const next = [...list, sec]
    stateRef.current.completedSections = next
    setCompletedSectionsState(next)
    queueSave(0)
  }, [queueSave])

  const setScores = useCallback((partKey, score) => {
    const next = { ...stateRef.current.scores, [partKey]: score }
    stateRef.current.scores = next
    setScoresStateRaw(next)
    queueSave(0)
  }, [queueSave])

  const setMeta = useCallback((patch) => {
    const next = { ...stateRef.current.meta, ...patch }
    stateRef.current.meta = next
    setMetaStateRaw(next)
    queueSave()
  }, [queueSave])

  const complete = useCallback(async () => {
    const sid = idRef.current
    if (!sid) return null
    if (saveTimer.current) clearTimeout(saveTimer.current)
    await flush()
    try {
      const { data } = await supabase.rpc('complete_test_session', { p_session_id: sid })
      idRef.current = null
      setId(null)
      return Array.isArray(data) ? data[0] : data
    } catch (e) {
      console.warn('[useTestSession] complete failed', e?.message || e)
      return null
    }
  }, [flush])

  const reset = useCallback(async () => {
    await complete()
    // Caller should re-mount or change deps to trigger a new bootstrap.
  }, [complete])

  return {
    id,
    loading,
    answers,
    currentSection,
    currentPart,
    currentQuestionIndex,
    completedSections,
    scores: scoresState,
    meta: metaState,
    saveAnswer,
    setAnswers,
    setCurrentQuestionIndex,
    setCurrentSection,
    setCurrentPart,
    markSectionComplete,
    setScores,
    setMeta,
    complete,
    reset,
    flush,
  }
}

export default useTestSession
