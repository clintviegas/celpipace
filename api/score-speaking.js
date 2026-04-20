export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const apiKey = process.env.OPENAI_API_KEY;
  if (!apiKey) {
    return res.status(500).json({ error: 'OpenAI API key not configured' });
  }

  const { responseText, prompt, taskType, topic } = req.body;

  if (!responseText || !prompt) {
    return res.status(400).json({ error: 'Missing responseText or prompt' });
  }

  const wordCount = responseText.trim().split(/\s+/).length;

  const systemPrompt = `You are a certified CELPIP Speaking examiner with 10+ years of experience. You evaluate spoken response transcripts using the official CELPIP-General scoring scale (3–12).

The student has completed a speaking task and typed a transcript of what they said. Evaluate the transcript as if it were a spoken response.

SCORING CRITERIA (score each 3–12):
1. **Task Fulfillment** (Content & Task Completion)
   - Does the response fully address the prompt and all required points?
   - Is the content relevant and on-topic throughout?
   - Is there sufficient detail and elaboration?

2. **Coherence & Organization** (Discourse Structure)
   - Is there a clear introduction, body, and conclusion?
   - Are ideas logically organized with smooth transitions?
   - Does the response flow naturally as spoken language?

3. **Vocabulary Range** (Lexical Resource)
   - Is word choice precise, varied, and natural for spoken English?
   - Are collocations and expressions used appropriately?
   - Is vocabulary sophisticated enough for the CLB target?

4. **Listenability** (Based on written transcript: fluency, pacing, naturalness)
   - Does the response read as natural spoken English (not overly formal/written)?
   - Is the pacing appropriate — not too short or too verbose?
   - Are filler words, self-corrections, or incomplete thoughts present?

SPEAKING TASK TYPE: ${taskType}${topic ? `\nSCENE/TOPIC: ${topic}\nFor "Describing a Scene" tasks, the student must describe what is happening in a ${topic} scene. Score Task Fulfillment based on how well they cover the specific elements of this scene (people, actions, spatial details, atmosphere). For "Making Predictions" tasks, score based on how well the student predicts what will happen next in this specific ${topic} scene with logical reasoning.` : ''}

SCORING GUIDELINES:
- 10–12: Advanced — near-native fluency, sophisticated vocabulary, fully addresses all parts of the prompt
- 8–9: Upper-Intermediate — clear and effective, good range, minor gaps in coverage
- 6–7: Intermediate — adequate communication, noticeable gaps, limited elaboration
- 4–5: Lower — limited range, frequent issues, incomplete task coverage
- 3: Developing — very limited, significant difficulty communicating ideas

IMPORTANT:
- Be fair but rigorous — match real CELPIP scoring standards
- Very short responses (under 40 words for a 60s task or under 60 words for a 90s task) should receive lower Task Fulfillment scores
- Responses that miss required points from the prompt should lose Task Fulfillment marks
- Provide specific, actionable feedback referencing the actual transcript
- Each suggestion must be practical and specific to this response

Respond with ONLY valid JSON in this exact format:
{
  "overall": <number 3.0-12.0 with one decimal>,
  "scores": {
    "taskFulfillment": <number 3-12>,
    "coherence": <number 3-12>,
    "vocabulary": <number 3-12>,
    "listenability": <number 3-12>
  },
  "feedback": "<2-3 sentences of specific feedback about this response>",
  "suggestions": [
    "<specific suggestion 1 referencing the actual transcript>",
    "<specific suggestion 2>",
    "<specific suggestion 3>",
    "<specific suggestion 4>"
  ]
}`;

  const userMessage = `SPEAKING PROMPT:
${prompt}

TASK TYPE: ${taskType}${topic ? `\nSCENE TOPIC: ${topic}` : ''}

STUDENT'S SPOKEN RESPONSE TRANSCRIPT (${wordCount} words):
${responseText}

Score this spoken response transcript. Return ONLY the JSON object.`;

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

    const jsonStr = content.replace(/```json?\n?/g, '').replace(/```/g, '').trim();
    const result = JSON.parse(jsonStr);

    const clamp = (v) => Math.max(3, Math.min(12, Number(v) || 5));
    const scores = {
      taskFulfillment: clamp(result.scores?.taskFulfillment),
      coherence: clamp(result.scores?.coherence),
      vocabulary: clamp(result.scores?.vocabulary),
      listenability: clamp(result.scores?.listenability),
    };
    const overall = +((scores.taskFulfillment + scores.coherence + scores.vocabulary + scores.listenability) / 4).toFixed(1);
    const clbBand = overall >= 10 ? '10+' : overall >= 9 ? '9' : overall >= 7.5 ? '8' : overall >= 6 ? '7' : overall >= 5 ? '6' : '5';

    return res.status(200).json({
      overall,
      clbBand,
      scores,
      feedback: result.feedback || 'No feedback available.',
      suggestions: Array.isArray(result.suggestions) ? result.suggestions.slice(0, 4) : [],
    });
  } catch (err) {
    console.error('Score speaking error:', err);
    return res.status(500).json({ error: 'Failed to score response' });
  }
}
