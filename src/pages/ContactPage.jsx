import { useEffect, useMemo, useState } from 'react'
import { Mail, MessageSquareText, Send, ClipboardList, CheckCircle2 } from 'lucide-react'
import SEO from '../components/SEO'
import { BRAND_NAME, SUPPORT_EMAIL } from '../data/constants'
import { useAuth } from '../context/AuthContext'
import { supabase } from '../lib/supabase'

const REQUEST_TYPES = [
  'Ask a question',
  'General feedback',
  'Technical problem',
  'Billing or refund',
  'Account access',
  'Content correction',
  'Complaint',
]

const SECTIONS = ['Not section-specific', 'Listening', 'Reading', 'Writing', 'Speaking', 'Mock exam', 'Subscription']
const URGENCIES = ['Normal', 'High', 'Blocking my practice']

function buildEmail({ type, section, urgency, name, email, message }) {
  const subject = `${BRAND_NAME} ${type}: ${section}`
  const body = [
    `Request type: ${type}`,
    `Section: ${section}`,
    `Urgency: ${urgency}`,
    `Name: ${name || '-'}`,
    `Account email: ${email || '-'}`,
    '',
    'Message:',
    message || '-',
  ].join('\n')

  return { subject, body }
}

export default function ContactPage() {
  const { user } = useAuth()
  const [type, setType] = useState('Ask a question')
  const [section, setSection] = useState('Not section-specific')
  const [urgency, setUrgency] = useState('Normal')
  const [name, setName] = useState('')
  const [email, setEmail] = useState(user?.email || '')
  const [message, setMessage] = useState('')
  const [copied, setCopied] = useState(false)
  const [sending, setSending] = useState(false)
  const [status, setStatus] = useState(null)

  useEffect(() => {
    if (user?.email) setEmail((current) => current || user.email)
  }, [user?.email])

  const emailContent = useMemo(
    () => buildEmail({ type, section, urgency, name, email, message }),
    [type, section, urgency, name, email, message]
  )

  const emailText = useMemo(() => [
    `To: ${SUPPORT_EMAIL}`,
    `Subject: ${emailContent.subject}`,
    '',
    emailContent.body,
  ].join('\n'), [emailContent])

  const handleSubmit = async (event) => {
    event.preventDefault()
    setSending(true)
    setStatus(null)
    try {
      const { data: { session } } = await supabase.auth.getSession()
      const token = session?.access_token
      const res = await fetch('/api/contact', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          ...(token ? { Authorization: `Bearer ${token}` } : {}),
        },
        body: JSON.stringify({ type, section, urgency, name, email, message }),
      })
      const text = await res.text()
      const data = text ? JSON.parse(text) : {}
      if (!res.ok) throw new Error(data.message || data.error || 'Could not send your question.')
      setStatus({
        type: data.emailSent ? 'success' : 'warning',
        text: data.emailSent
          ? 'Your question was sent and saved. We will reply by email.'
          : 'Your question was saved. Email delivery needs the mail provider configured, so copy the message as a backup.',
      })
      setMessage('')
    } catch (error) {
      setStatus({ type: 'error', text: error.message || 'Could not send your question.' })
    } finally {
      setSending(false)
    }
  }

  const copyMessage = async () => {
    try {
      await navigator.clipboard.writeText(emailText)
      setCopied(true)
      window.setTimeout(() => setCopied(false), 1800)
    } catch {
      setCopied(false)
    }
  }

  return (
    <main className="contact-page">
      <SEO
        title="Contact Support"
        description={`Contact ${BRAND_NAME} support for feedback, complaints, billing questions, and technical help.`}
        canonical="/contact"
      />
      <section className="contact-shell">
        <div className="contact-heading">
          <p className="contact-kicker">Support</p>
          <h1>Write to {BRAND_NAME}</h1>
          <p>
            Send a question, feedback, billing request, complaint, or technical issue to{' '}
            <a href={`mailto:${SUPPORT_EMAIL}`}>{SUPPORT_EMAIL}</a>.
          </p>
        </div>

        <div className="contact-layout">
          <form className="contact-form" onSubmit={handleSubmit}>
            <div className="contact-field contact-field--full">
              <label htmlFor="contact-type">What is this about?</label>
              <select id="contact-type" value={type} onChange={(event) => setType(event.target.value)}>
                {REQUEST_TYPES.map((item) => <option key={item}>{item}</option>)}
              </select>
            </div>

            <div className="contact-field">
              <label htmlFor="contact-section">Area</label>
              <select id="contact-section" value={section} onChange={(event) => setSection(event.target.value)}>
                {SECTIONS.map((item) => <option key={item}>{item}</option>)}
              </select>
            </div>

            <div className="contact-field">
              <label htmlFor="contact-urgency">Priority</label>
              <select id="contact-urgency" value={urgency} onChange={(event) => setUrgency(event.target.value)}>
                {URGENCIES.map((item) => <option key={item}>{item}</option>)}
              </select>
            </div>

            <div className="contact-field">
              <label htmlFor="contact-name">Name</label>
              <input id="contact-name" value={name} onChange={(event) => setName(event.target.value)} placeholder="Your name" />
            </div>

            <div className="contact-field">
              <label htmlFor="contact-email">Account email</label>
              <input id="contact-email" type="email" value={email} onChange={(event) => setEmail(event.target.value)} placeholder="you@example.com" />
            </div>

            <div className="contact-field contact-field--full">
              <label htmlFor="contact-message">Message</label>
              <textarea
                id="contact-message"
                value={message}
                onChange={(event) => setMessage(event.target.value)}
                placeholder="Ask your question or tell us what happened, what page you were on, and what you expected."
                rows={8}
                required
              />
            </div>

            <div className="contact-actions">
              <button type="submit" className="contact-primary" disabled={sending}><Send size={17} /> {sending ? 'Sending...' : 'Send Question'}</button>
              <button type="button" className="contact-secondary" onClick={copyMessage}>
                {copied ? <CheckCircle2 size={17} /> : <ClipboardList size={17} />}
                {copied ? 'Copied' : 'Copy Text'}
              </button>
            </div>
            {status && <div className={`contact-status contact-status--${status.type}`}>{status.text}</div>}
          </form>

          <aside className="contact-side">
            <div className="contact-side-icon"><Mail size={23} /></div>
            <h2>{SUPPORT_EMAIL}</h2>
            <p>Use the form to prepare a clean message, or write directly from your inbox.</p>
            <div className="contact-side-list">
              <span><MessageSquareText size={16} /> Questions</span>
              <span><MessageSquareText size={16} /> Feedback</span>
              <span><MessageSquareText size={16} /> Complaints</span>
              <span><MessageSquareText size={16} /> Billing help</span>
              <span><MessageSquareText size={16} /> Technical issues</span>
            </div>
          </aside>
        </div>
      </section>
    </main>
  )
}