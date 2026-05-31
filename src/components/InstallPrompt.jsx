import { useEffect, useState } from 'react'
import { onUpdateAvailable, applyUpdate } from '../lib/registerSW'

const DISMISS_KEY = 'celpipiq_pwa_install_dismissed'
const DISMISS_DAYS = 14

function recentlyDismissed() {
  try {
    const ts = Number(localStorage.getItem(DISMISS_KEY) || 0)
    return ts && (Date.now() - ts) < DISMISS_DAYS * 86400000
  } catch { return false }
}

function isStandalone() {
  if (typeof window === 'undefined') return false
  return window.matchMedia?.('(display-mode: standalone)').matches
    || window.navigator.standalone === true
}

export default function InstallPrompt() {
  const [deferred, setDeferred] = useState(null)
  const [showInstall, setShowInstall] = useState(false)
  const [showUpdate, setShowUpdate] = useState(false)

  // Capture the install prompt (Chromium/Android/desktop).
  useEffect(() => {
    if (isStandalone() || recentlyDismissed()) return
    const onBeforeInstall = (e) => {
      e.preventDefault()
      setDeferred(e)
      setShowInstall(true)
    }
    const onInstalled = () => { setShowInstall(false); setDeferred(null) }
    window.addEventListener('beforeinstallprompt', onBeforeInstall)
    window.addEventListener('appinstalled', onInstalled)
    return () => {
      window.removeEventListener('beforeinstallprompt', onBeforeInstall)
      window.removeEventListener('appinstalled', onInstalled)
    }
  }, [])

  // Listen for service-worker updates.
  useEffect(() => {
    onUpdateAvailable(() => setShowUpdate(true))
  }, [])

  const install = async () => {
    if (!deferred) return
    setShowInstall(false)
    deferred.prompt()
    try { await deferred.userChoice } catch { /* ignore */ }
    setDeferred(null)
  }

  const dismissInstall = () => {
    setShowInstall(false)
    try { localStorage.setItem(DISMISS_KEY, String(Date.now())) } catch { /* ignore */ }
  }

  if (showUpdate) {
    return (
      <div style={styles.wrap} role="status" aria-live="polite">
        <div style={styles.toast}>
          <span style={styles.icon}>🔄</span>
          <div style={styles.body}>
            <div style={styles.title}>Update available</div>
            <div style={styles.text}>A new version of CELPIPACE is ready.</div>
          </div>
          <button style={styles.primary} onClick={applyUpdate}>Refresh</button>
          <button style={styles.close} onClick={() => setShowUpdate(false)} aria-label="Dismiss">×</button>
        </div>
      </div>
    )
  }

  if (showInstall) {
    return (
      <div style={styles.wrap}>
        <div style={styles.toast}>
          <span style={styles.icon}>📲</span>
          <div style={styles.body}>
            <div style={styles.title}>Install CELPIPACE</div>
            <div style={styles.text}>Add it to your home screen for quick, full-screen study sessions.</div>
          </div>
          <button style={styles.primary} onClick={install}>Install</button>
          <button style={styles.close} onClick={dismissInstall} aria-label="Dismiss">×</button>
        </div>
      </div>
    )
  }

  return null
}

const styles = {
  wrap: { position: 'fixed', left: 16, right: 16, bottom: 16, zIndex: 1200, display: 'flex', justifyContent: 'center', pointerEvents: 'none' },
  toast: {
    pointerEvents: 'auto',
    display: 'flex', alignItems: 'center', gap: 12,
    width: '100%', maxWidth: 440,
    background: '#0f172a', color: '#fff',
    borderRadius: 14, padding: '12px 14px',
    boxShadow: '0 10px 36px rgba(15,23,42,0.32)',
  },
  icon: { fontSize: 22, flexShrink: 0 },
  body: { flex: 1, minWidth: 0 },
  title: { fontSize: 14, fontWeight: 700, lineHeight: 1.2 },
  text: { fontSize: 12.5, color: '#cbd5e1', marginTop: 2, lineHeight: 1.4 },
  primary: { background: '#34d399', color: '#06281c', border: 'none', borderRadius: 9, padding: '8px 14px', fontSize: 13, fontWeight: 700, cursor: 'pointer', flexShrink: 0 },
  close: { background: 'transparent', color: '#94a3b8', border: 'none', fontSize: 20, lineHeight: 1, cursor: 'pointer', padding: '0 2px', flexShrink: 0 },
}
