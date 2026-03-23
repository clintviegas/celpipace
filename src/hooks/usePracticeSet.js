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
      console.log(`[usePracticeSet] Fetching for section="${section}", part="${part}"`)
      
      // Fetch questions directly by section and part
      const { data: questionsData, error: questionsErr } = await supabase
        .from('questions')
        .select('*')
        .eq('section', section)
        .eq('part', part)
        .order('number', { ascending: true })

      if (cancelled) return

      console.log(`[usePracticeSet] Query error:`, questionsErr)
      console.log(`[usePracticeSet] Fetched ${questionsData?.length || 0} questions:`, questionsData)

      if (questionsErr) {
        console.error('Error fetching questions:', questionsErr)
        setError(questionsErr.message)
        setLoading(false)
        return
      }

      // Group questions by part (usually just one group per part)
      // and format them into practice sets
      const mapped = [{
        setNumber: 1,
        setTitle: part === 'R1' ? 'Email Inquiry' 
                : part === 'R2' ? 'Schedule Matching'
                : part === 'R3' ? 'Digital Literacy'
                : part === 'R4' ? 'AI Regulation'
                : part === 'L1' ? 'Library Customer Service'
                : part === 'L2' ? 'Friends Planning a Trip'
                : part === 'L3' ? 'Community Centre'
                : part === 'L4' ? 'City Transit News'
                : part === 'L5' ? 'Remote Work Panel'
                : `Part ${part}`,
        instruction: questionsData?.[0]?.instruction || 'Answer the questions below.',
        scenario: questionsData?.[0]?.title || '',
        difficulty: questionsData?.[0]?.difficulty || 'medium',
        passage: questionsData?.[0]?.passage || null,
        diagramHtml: null,
        questions: (questionsData || []).map(q => {
          const options = [q.option_a, q.option_b, q.option_c, q.option_d].filter(Boolean)
          // Find the index of the correct answer
          const correctAnswerIndex = options.indexOf(q.correct_answer)
          
          return {
            id:           q.id,
            text:         q.question_text,
            options:      options,
            answer:       correctAnswerIndex >= 0 ? correctAnswerIndex : 0, // Use found index or default to 0
            explanation:  q.explanation || '',
            difficulty:   q.difficulty || 'medium',
            questionType: q.type || 'mcq',
          }
        }),
      }]

      setSets(mapped)
      setLoading(false)
    }

    load()
    return () => { cancelled = true }
  }, [section, part])

  return { sets, loading, error }
}
