const MAX_MESSAGES = 12
const MAX_MESSAGE_CHARS = 1200
const SUPPORT_EMAIL = 'info@celpipace.ca'

function cleanMessages(messages) {
  if (!Array.isArray(messages)) return []

  return messages
    .slice(-MAX_MESSAGES)
    .map((message) => ({
      role: message?.role === 'assistant' ? 'assistant' : 'user',
      content: String(message?.content || '').trim().slice(0, MAX_MESSAGE_CHARS),
    }))
    .filter((message) => message.content)
}

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' })
  }

  const apiKey = process.env.OPENAI_API_KEY
  if (!apiKey) {
    return res.status(503).json({ error: 'Chat is not configured yet.' })
  }

  const messages = cleanMessages(req.body?.messages)
  if (!messages.length) {
    return res.status(400).json({ error: 'Message is required.' })
  }

  const systemPrompt = `You are the CELPIPACE live study assistant. Help users with CELPIP preparation, using the CELPIPACE platform, subscription questions, billing portal navigation, and study planning.

Rules:
- Keep answers concise, practical, and friendly.
- CELPIPACE is independent and not affiliated with CELPIP or Paragon Testing Enterprises.
- For cancellations, card updates, invoices, or subscription changes, direct signed-in users to Manage Subscription > Open Billing Portal. Explain that Stripe securely handles billing changes.
- Do not claim to perform official CELPIP scoring. For detailed writing or speaking scoring, direct users to the app's AI scoring tools.
- Do not ask for card numbers, passwords, verification codes, or sensitive immigration documents.
- If the user needs account-specific help you cannot access, ask them to email ${SUPPORT_EMAIL} with their account email and a short description of the issue.`

  try {
    const response = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${apiKey}`,
      },
      body: JSON.stringify({
        model: 'gpt-4o-mini',
        messages: [
          { role: 'system', content: systemPrompt },
          ...messages,
        ],
        temperature: 0.35,
        max_tokens: 450,
      }),
    })

    if (!response.ok) {
      const detail = await response.text()
      console.error('[chatbot] OpenAI error:', response.status, detail)
      return res.status(502).json({ error: 'Chat service is unavailable right now.' })
    }

    const data = await response.json()
    const reply = data.choices?.[0]?.message?.content?.trim()
    if (!reply) {
      return res.status(502).json({ error: 'Chat service returned an empty response.' })
    }

    return res.status(200).json({ reply })
  } catch (err) {
    console.error('[chatbot] error:', err)
    return res.status(500).json({ error: 'Chat failed. Please try again.' })
  }
}