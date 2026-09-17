import { Component } from 'react'
import { captureError } from '../lib/observability'

export default class ErrorBoundary extends Component {
  constructor(props) {
    super(props)
    this.state = { error: null }
  }

  static getDerivedStateFromError(error) {
    return { error }
  }

  componentDidCatch(error, info) {
    // This is the surface that caught the blank-homepage incident
    // (`TESTIMONIALS is not defined` in a lazy-loaded chunk). It logged to a
    // console nobody was watching; now it reports.
    captureError(error, {
      surface: 'ErrorBoundary',
      boundary: this.props.name || 'root',
      componentStack: info?.componentStack?.slice(0, 500),
    })
  }

  handleReload = () => {
    window.location.reload()
  }

  handleHome = () => {
    window.location.href = '/'
  }

  render() {
    const { error } = this.state
    if (!error) return this.props.children

    const message = error?.message || 'Something went wrong.'
    const isChunk = /Loading chunk|Failed to fetch dynamically imported module/i.test(message)

    return (
      <main
        style={{
          minHeight: '100vh',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          padding: 24,
          background: 'linear-gradient(180deg, #f8fafc 0%, #eef2ff 100%)',
          fontFamily: 'system-ui, -apple-system, Segoe UI, Roboto, sans-serif',
        }}
      >
        <section
          style={{
            maxWidth: 520,
            width: '100%',
            background: '#fff',
            borderRadius: 16,
            padding: '32px 28px',
            boxShadow: '0 12px 40px rgba(15, 31, 61, 0.12)',
            textAlign: 'center',
          }}
        >
          <div style={{ fontSize: 40, marginBottom: 12 }} aria-hidden="true">⚠️</div>
          <h1 style={{ margin: '0 0 8px', fontSize: 24, color: '#0F1F3D' }}>
            {isChunk ? 'Update available' : 'Page error'}
          </h1>
          <p style={{ margin: '0 0 20px', color: '#64748b', lineHeight: 1.55, fontSize: 15 }}>
            {isChunk
              ? 'A newer version of CELPIPACE was deployed. Reload to continue.'
              : 'This page hit an unexpected error. Your progress is saved — try reloading or return home.'}
          </p>
          <div style={{ display: 'flex', gap: 10, justifyContent: 'center', flexWrap: 'wrap' }}>
            <button
              type="button"
              onClick={this.handleReload}
              style={{
                background: 'linear-gradient(135deg, #ffd66a, #f5b800)',
                color: '#0F1F3D',
                border: 'none',
                borderRadius: 10,
                padding: '11px 18px',
                fontWeight: 700,
                cursor: 'pointer',
              }}
            >
              Reload page
            </button>
            <button
              type="button"
              onClick={this.handleHome}
              style={{
                background: '#fff',
                color: '#0F1F3D',
                border: '1px solid #cbd5e1',
                borderRadius: 10,
                padding: '11px 18px',
                fontWeight: 600,
                cursor: 'pointer',
              }}
            >
              Go to homepage
            </button>
          </div>
          {import.meta.env.DEV && (
            <pre
              style={{
                marginTop: 20,
                textAlign: 'left',
                fontSize: 11,
                color: '#94a3b8',
                whiteSpace: 'pre-wrap',
                wordBreak: 'break-word',
                maxHeight: 120,
                overflow: 'auto',
              }}
            >
              {message}
            </pre>
          )}
        </section>
      </main>
    )
  }
}
