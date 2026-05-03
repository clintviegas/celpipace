/* global process, fetch */

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const apiKey = process.env.OPENAI_API_KEY;
  if (!apiKey) {
    return res.status(500).json({ error: 'OpenAI API key not configured' });
  }

  const { responseText, prompt, criteria, taskType } = req.body;

  if (!responseText || !prompt) {
    return res.status(400).json({ error: 'Missing responseText or prompt' });
  }

  const wordCount = responseText.trim().split(/\s+/).length;

  const systemPrompt = `You are a certified CELPIP Writing examiner with 10+ years of experience. You evaluate responses using the official CELPIP-General scoring scale (3–12).

SCORING CRITERIA (score each 3–12):
1. **Task Fulfillment** (Content & Task Completion)
   - Does the response fully address the prompt and all required points?
   - Is the purpose, audience, and tone appropriate?
   - Is the response within the recommended 150–200 word range?

2. **Coherence & Organization** (Text Structure)
   - Is there a clear introduction, body, and closing?
   - Are ideas logically organized with smooth transitions?
   - Does each paragraph serve a clear purpose?

3. **Vocabulary Range** (Lexical Resource)
   - Is word choice precise and varied?
   - Are collocations and idioms used naturally?
   - Is vocabulary appropriate for the context and audience?

4. **Readability & Grammar** (Linguistic Control)
   - Is grammar accurate (tenses, articles, prepositions, subject-verb agreement)?
   - Is sentence structure varied (simple, compound, complex)?
   - Are spelling and punctuation correct?

SCORING GUIDELINES:
- 10–12: Advanced — near-native fluency, sophisticated vocabulary, complex structures with minimal errors
- 8–9: Upper-Intermediate — clear and effective, good range, occasional minor errors
- 6–7: Intermediate — adequate communication, noticeable errors that don't impede understanding
- 4–5: Lower — limited range, frequent errors, meaning sometimes unclear
- 3: Developing — very limited, significant difficulty communicating

TASK TYPE: ${taskType === 'W1' ? 'Email Writing (formal/semi-formal/informal based on context)' : 'Survey Response (expressing and supporting an opinion)'}

IMPORTANT:
- Be fair but rigorous — match real CELPIP scoring standards
- Shorter responses (<140 words) should receive lower Task Fulfillment scores
- Provide specific, actionable feedback referencing the actual text
- Each suggestion must reference a specific part of the response that can be improved

Respond with ONLY valid JSON in this exact format:
{
  "overall": <number 3.0-12.0 with one decimal>,
  "scores": {
    "taskFulfillment": <number 3-12>,
    "coherence": <number 3-12>,
    "vocabulary": <number 3-12>,
    "readability": <number 3-12>
  },
  "feedback": "<2-3 sentences of specific feedback about this response>",
  "suggestions": [
    "<specific suggestion 1 referencing the actual text>",
    "<specific suggestion 2>",
    "<specific suggestion 3>",
    "<specific suggestion 4>"
  ]
}`;

  const userMessage = `WRITING PROMPT:
${prompt}

SCORING CRITERIA TO EVALUATE:
${(criteria || ['Task Fulfillment', 'Coherence', 'Vocabulary', 'Grammar']).join(', ')}

STUDENT'S RESPONSE (${wordCount} words):
${responseText}

Score this response. Return ONLY the JSON object.`;

  try {
    const response = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${apiKey}`,
      },
      body: JSON.stringify({
        model: 'gpt-4o-mini',
        messages: [
          { role: 'system', content: systemPrompt },
          { role: 'user', content: userMessage },
        ],
        temperature: 0.3,
        max_tokens: 600,
      }),
    });

    if (!response.ok) {
      const errBody = await response.text();
      console.error('OpenAI error:', response.status, errBody);
      return res.status(502).json({ error: 'AI service error', detail: errBody });
    }

    const data = await response.json();
    const content = data.choices?.[0]?.message?.content;

    if (!content) {
      return res.status(502).json({ error: 'Empty AI response' });
    }

    // Parse JSON from response (handle markdown code fences if present)
    const jsonStr = content.replace(/```json?\n?/g, '').replace(/```/g, '').trim();
    const result = JSON.parse(jsonStr);

    // Validate, clamp, and round scores to the CELPIP 0-12 display scale.
    const clamp = (v) => Math.max(3, Math.min(12, Math.round(Number(v) || 5)));
    const scores = {
      taskFulfillment: clamp(result.scores?.taskFulfillment),
      coherence: clamp(result.scores?.coherence),
      vocabulary: clamp(result.scores?.vocabulary),
      readability: clamp(result.scores?.readability),
    };
    const rawOverall = +((scores.taskFulfillment + scores.coherence + scores.vocabulary + scores.readability) / 4).toFixed(1);
    const overall = Math.max(3, Math.min(12, Math.round(rawOverall)));
    const clbBand = overall;

    return res.status(200).json({
      overall,
      rawOverall,
      clbBand,
      scores,
      feedback: result.feedback || 'No feedback available.',
      suggestions: Array.isArray(result.suggestions) ? result.suggestions.slice(0, 4) : [],
    });
  } catch (err) {
    console.error('Score writing error:', err);
    return res.status(500).json({ error: 'Failed to score response' });
  }
}
