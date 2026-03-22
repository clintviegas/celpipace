import { useState, useEffect } from 'react'
import { supabase } from '../lib/supabase'

/**
 * useReadingSet
 * Fetches all questions for a given part (e.g. 'R1') from Supabase.
 * Groups rows by set_number and returns an array of set objects.
 *
 * Returns:
 *   sets: [
 *     {
 *       setNumber:   1,
 *       setTitle:    'Email — Noise Complaint...',
 *       instruction: 'Read the email below...',
 *       scenario:    'Residential — Tenant Correspondence',
 *       difficulty:  'easy',          ← difficulty of the set (from Q1)
 *       passage:     '...',           ← shared passage text
 *       questions: [
 *         { id, text, options, answer, explanation, difficulty }
 *       ]
 *     },
 *     ...
 *   ]
 */
export function useReadingSet(part) {
  const [sets,    setSets]    = useState([])
  const [loading, setLoading] = useState(true)
  const [error,   setError]   = useState(null)

  useEffect(() => {
    if (!part) return

    let cancelled = false
    setLoading(true)
    setError(null)

    async function load() {
      const { data, error: err } = await supabase
        .from('reading_questions')
        .select('*')
        .eq('part', part)
        .order('set_number',     { ascending: true })
        .order('question_order', { ascending: true })

      if (cancelled) return

      if (err) {
        setError(err.message)
        setLoading(false)
        return
      }

      // Group rows by set_number
      const grouped = {}
      for (const row of (data || [])) {
        const n = row.set_number
        if (!grouped[n]) {
          grouped[n] = {
            setNumber:   n,
            setTitle:    row.set_title,
            instruction: row.instruction,
            scenario:    row.scenario,
            difficulty:  row.difficulty,          // set-level difficulty from Q1
            passage:     row.passage ?? null,     // passage only on first row
            diagramHtml: row.diagram_html ?? null,// HTML table for R2 diagram sets
            questions:   [],
          }
        }
        // Capture passage / diagram only from rows that carry them
        if (row.passage)      grouped[n].passage     = row.passage
        if (row.diagram_html) grouped[n].diagramHtml = row.diagram_html

        grouped[n].questions.push({
          id:           row.question_order,
          text:         row.question_text,
          options:      row.options,               // JSONB → already an array
          answer:       row.correct_index,
          explanation:  row.explanation,
          difficulty:   row.difficulty,
          questionType: row.question_type || 'mcq', // 'mcq' | 'fill_blank'
        })
      }

      setSets(Object.values(grouped))
      setLoading(false)
    }

    load()
    return () => { cancelled = true }
  }, [part])

  return { sets, loading, error }
}
