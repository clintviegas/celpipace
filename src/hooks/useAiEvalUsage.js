import { useCallback, useEffect, useState } from 'react'
import { supabase } from '../lib/supabase'
import { FREE_AI_SPEAKING_EVALS, FREE_AI_WRITING_EVALS } from '../data/constants'

const LIMITS = {
  writing: FREE_AI_WRITING_EVALS,
  speaking: FREE_AI_SPEAKING_EVALS,
}

/** Remaining free AI eval count for writing or speaking (null when premium). */
export function useAiEvalUsage(userId, section, isPremium) {
  const [usage, setUsage] = useState(null)
  const [tick, setTick] = useState(0)
  const refresh = useCallback(() => setTick(t => t + 1), [])

  useEffect(() => {
    if (!userId || isPremium || !LIMITS[section]) {
      setUsage(null)
      return
    }

    let cancelled = false
    ;(async () => {
      const { count, error } = await supabase
        .from('essay_embeddings')
        .select('id', { count: 'exact', head: true })
        .eq('user_id', userId)
        .eq('section', section)
        .eq('source', 'submission')

      if (cancelled) return
      const limit = LIMITS[section]
      const used = error ? 0 : (count ?? 0)
      setUsage({
        used,
        limit,
        remaining: Math.max(0, limit - used),
      })
    })()

    return () => { cancelled = true }
  }, [userId, section, isPremium, tick])

  return { usage, refresh }
}
