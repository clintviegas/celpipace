import { useState, useEffect } from 'react'
import { supabase } from '../lib/supabase'

/**
 * useReadingSet
 * Fetches all questions for a given part (e.g. 'R1') from Supabase.
 * Returns questions sorted by question_order.
 *
 * Usage:
 *   const { questions, passage, meta, loading, error } = useReadingSet('R1')
 */
export function useReadingSet(part) {
  const [questions, setQuestions] = useState([])
  const [passage,   setPassage]   = useState(null)
  const [meta,      setMeta]      = useState(null)   // { set_title, instruction, scenario }
  const [loading,   setLoading]   = useState(true)
  const [error,     setError]     = useState(null)

  useEffect(() => {
    if (!part) return

    let cancelled = false
    setLoading(true)
    setError(null)

    async function fetch() {
      const { data, error: err } = await supabase
        .from('reading_questions')
        .select('*')
        .eq('part', part)
        .order('question_order', { ascending: true })

      if (cancelled) return

      if (err) {
        setError(err.message)
        setLoading(false)
        return
      }

      if (data && data.length > 0) {
        // Passage is stored on the first question row — reuse for all in the set
        const firstPassage = data.find(q => q.passage)?.passage ?? null
        setPassage(firstPassage)
        setMeta({
          set_title:   data[0].set_title,
          instruction: data[0].instruction,
          scenario:    data[0].scenario,
        })
        setQuestions(
          data.map(q => ({
            id:          q.question_order,
            text:        q.question_text,
            options:     q.options,           // already an array from jsonb
            answer:      q.correct_index,
            explanation: q.explanation,
            difficulty:  q.difficulty,
          }))
        )
      }

      setLoading(false)
    }

    fetch()
    return () => { cancelled = true }
  }, [part])

  return { questions, passage, meta, loading, error }
}
