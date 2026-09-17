# Listening Trap Authoring Playbook

Zero-runtime-token strategy: harder MCQ distractors and post-answer explanations live in static JSON. Answer validation stays `selectedIndex === question.answer`.

## Pilot scope

| Part | Set | Title | Questions |
|------|-----|-------|-----------|
| L1 | 1 | Returning a Damaged Blender | 8 |
| L2 | 1 | Planning a Weekend Hike | 5 |
| L3 | 1 | Library Programs and Hours | 8 |
| L4 | 1 | Local Park Reopening After Renovations | 5 |
| L5 | 1 | Planning a Team Lunch | 6 |
| L6 | 1 | Paper Books vs E-Books | 6 |

Source enrichments: `src/data/listening/pilot-set1-traps.json`  
Apply to bundle: `node scripts/apply-listening-pilot.mjs`

## Per-question checklist

For each question, rewrite **wrong options only** (keep the correct answer transcript-faithful, paraphrased if needed):

1. **Primary trap** — quotes an early or rejected suggestion before the speaker changes their mind (L1 decision-tracking, L5 venue/day picks).
2. **Near-synonym trap** — reuses a transcript word in the wrong slot or register (e.g. “escarpment” vs “Bruce Trail”, “refund” vs “exchange”).
3. **Partial-answer trap** — one true detail but missing a condition (“federal grants” without “municipal reserves”).
4. **Speaker-swap trap** — attribute a statement or preference to the wrong speaker (L5/L6).
5. **Number/time trap** — adjacent number or wrong unit from the same transcript (“six months” vs “eight months”).
6. **Overstatement trap** — “always / entirely / completely” when audio says “often / partly / a few”.

## Explanation format (mirror Reading)

One string per question, naming the correct letter and each major distractor:

```
B is correct: [why from transcript]. A is the primary trap — [why wrong]. C is a near-synonym trap — [why wrong]. D is a number trap — [why wrong].
```

Optional metadata (no scoring change): `primary_trap` on the question object for later analytics.

## QA rule

Every trap must be **defensibly wrong** from the transcript alone — no outside knowledge, no ambiguous wording.

## Rollout after pilot

1. Compare pilot set scores vs non-pilot sets in the same part.
2. If scores drop ~10–20 pts but explanations reduce repeat misses → expand L5/L6, then L1–L4.
3. Reference “see explanation after each question” in listening score tips once UI is live.
