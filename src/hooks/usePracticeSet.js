import { useState, useEffect } from 'react'
import { supabase } from '../lib/supabase'

/**
 * usePracticeSet
 * Generic hook — works for all four sections (reading, listening, writing, speaking).
 *
 * Fetches practice_sets rows with their nested questions using a single
 * Supabase nested select. No manual JS grouping required.
 *
 * Returns sets shaped identically to the old useReadingSet output so that
 * PracticeSetPage requires no field-name changes:
 *
 *   sets: [
 *     {
 *       setNumber:    1,
 *       setTitle:     'Email — Noise Complaint...',
 *       instruction:  'Read the email below...',
 *       scenario:     'Residential — Tenant Correspondence',
 *       difficulty:   'easy',
 *       passage:      '...',
 *       diagramHtml:  null | '<table>...</table>',
 *       questions: [
 *         { id, text, options, answer, explanation, difficulty, questionType }
 *       ]
 *     },
 *     ...
 *   ]
 *
 * @param {string|null} section  e.g. 'reading' | 'listening' | 'writing' | 'speaking'
 * @param {string|null} part     e.g. 'R1' | 'R2' | 'L3' | 'W1'
 */
export function usePracticeSet(section, part) {
  const [sets,    setSets]    = useState([])
  const [loading, setLoading] = useState(true)
  const [error,   setError]   = useState(null)

  useEffect(() => {
    if (!section || !part) {
      setLoading(false)
      return
    }

    let cancelled = false
    setLoading(true)
    setError(null)

    async function load() {
      const { data, error: err } = await supabase
        .from('practice_sets')
        .select(`
          id,
          set_number,
          set_title,
          instruction,
          scenario,
          difficulty,
          passage,
          diagram_html,
          questions (
            id,
            question_order,
            question_type,
            question_text,
            options,
            correct_index,
            explanation
          )
        `)
        .eq('section', section)
        .eq('part',    part)
        .order('set_number',      { ascending: true })
        .order('question_order',  { ascending: true, foreignTable: 'questions' })

      if (cancelled) return

      if (err) {
        setError(err.message)
        setLoading(false)
        return
      }

      // Map DB snake_case → camelCase expected by PracticeSetPage
      const mapped = (data || []).map(set => ({
        setNumber:   set.set_number,
        setTitle:    set.set_title,
        instruction: set.instruction,
        scenario:    set.scenario,
        difficulty:  set.difficulty,
        passage:     set.passage     ?? null,
        diagramHtml: set.diagram_html ?? null,
        questions:   (set.questions || []).map(q => ({
          id:           q.id,           // now a UUID (used as React key)
          text:         q.question_text,
          options:      q.options,       // JSONB → already an array
          answer:       q.correct_index,
          explanation:  q.explanation,
          difficulty:   set.difficulty,  // inherit set difficulty
          questionType: q.question_type, // 'mcq' | 'fill_blank'
        })),
      }))

      setSets(mapped)
      setLoading(false)
    }

    load()
    return () => { cancelled = true }
  }, [section, part])

  return { sets, loading, error }
}
