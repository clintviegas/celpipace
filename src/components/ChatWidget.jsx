import { useEffect, useRef, useState } from 'react'
import { MessageCircle, Send, X } from 'lucide-react'
import { useNavigate } from 'react-router-dom'
import { SUPPORT_EMAIL } from '../data/constants'
import { authedFetch } from '../lib/apiClient'

const STARTER_MESSAGE = {
  role: 'assistant',
  content: `Hi, I can help with CELPIP study questions, mock exams, scoring tools, and billing navigation. For account-specific help, write to ${SUPPORT_EMAIL}.`,
}

const QUICK_PROMPTS = [
  'How do I cancel my subscription?',
  'Make me a 7-day CELPIP study plan',
  'How do I contact support?',
  'How do I improve Speaking Task 3?',
]

export default function ChatWidget() {
  const [open, setOpen] = useState(false)
  const [messages, setMessages] = useState([STARTER_MESSAGE])
  const [draft, setDraft] = useState('')
  const [busy, setBusy] = useState(false)
  const [error, setError] = useState('')
  const messagesRef = useRef(null)
  const navigate = useNavigate()

  useEffect(() => {
    if (!messagesRef.current) return
    messagesRef.current.scrollTop = messagesRef.current.scrollHeight
  }, [messages, busy, open])

  const sendMessage = async (text = draft) => {
    const content = text.trim()
    if (!content || busy) return

    const nextMessages = [...messages, { role: 'user', content }]
    setMessages(nextMessages)
    setDraft('')
    setBusy(true)
    setError('')

    try {
      const res = await authedFetch('/api/chatbot', {
        body: { messages: nextMessages.slice(-10) },
      })
      const data = await res.json()
      if (res.status === 429) throw new Error(data.message || 'Too many messages — try again later.')
      if (!res.ok || !data.reply) throw new Error(data.error || 'Chat is unavailable right now.')
      setMessages([...nextMessages, { role: 'assistant', content: data.reply }])
    } catch (err) {
      setError(err.message || 'Chat is unavailable right now.')
    } finally {
      setBusy(false)
    }
  }

  const handleSubmit = (event) => {
    event.preventDefault()
    sendMessage()
  }

  const goToBilling = () => {
    setOpen(false)
    navigate('/subscription')
  }

  return (
    <div className={`chat-widget${open ? ' chat-widget--open' : ''}`}>
      {open && (
        <section className="chat-panel" aria-label="CELPIPACE live chat">
          <header className="chat-panel-header">
            <div>
              <strong>CELPIPACE Chat</strong>
              <span>Study and account help</span>
            </div>
            <button type="button" onClick={() => setOpen(false)} aria-label="Close chat">
              <X size={18} />
            </button>
          </header>

          <div className="chat-messages" ref={messagesRef} aria-live="polite">
            {messages.map((message, index) => (
              <div key={`${message.role}-${index}`} className={`chat-message chat-message--${message.role}`}>
                {message.content}
              </div>
            ))}
            {busy && <div className="chat-message chat-message--assistant">Typing...</div>}
          </div>

          <div className="chat-quick-row">
            {QUICK_PROMPTS.map((prompt) => (
              <button key={prompt} type="button" onClick={() => sendMessage(prompt)} disabled={busy}>
                {prompt}
              </button>
            ))}
          </div>

          <button type="button" className="chat-billing-link" onClick={goToBilling}>
            Manage subscription and cancellation
          </button>

          {error && <div className="chat-error">{error}</div>}

          <form className="chat-form" onSubmit={handleSubmit}>
            <input
              value={draft}
              onChange={(event) => setDraft(event.target.value)}
              placeholder="Ask about CELPIP or your account"
              maxLength={900}
            />
            <button type="submit" disabled={busy || !draft.trim()} aria-label="Send message">
              <Send size={17} />
            </button>
          </form>
        </section>
      )}

      <button
        type="button"
        className="chat-launcher"
        onClick={() => setOpen((value) => !value)}
        aria-label={open ? 'Close chat' : 'Open chat'}
      >
        {open ? <X size={22} /> : <MessageCircle size={23} />}
      </button>
    </div>
  )
}