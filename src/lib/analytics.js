import { supabase } from './supabase'

const SESSION_KEY = 'celpipace_analytics_session_id'
const FLUSH_DELAY_MS = 1200
const MAX_BATCH_SIZE = 10

let queue = []
let flushTimer = null
let lastPageView = { key: '', at: 0 }

function getSessionId() {
  if (typeof window === 'undefined') return 'server'
  try {
    let sessionId = window.localStorage.getItem(SESSION_KEY)
    if (!sessionId) {
      sessionId = crypto.randomUUID?.() || `${Date.now()}-${Math.random().toString(16).slice(2)}`
      window.localStorage.setItem(SESSION_KEY, sessionId)
    }
    return sessionId
  } catch {
    return 'local-storage-unavailable'
  }
}


function trimText(value, max = 240) {
  return String(value || '').replace(/\s+/g, ' ').trim().slice(0, max)
}

function getElementLabel(element) {
  return trimText(
    element.getAttribute('aria-label') ||
    element.getAttribute('title') ||
    element.getAttribute('name') ||
    element.innerText ||
    element.textContent ||
    element.value ||
    element.id ||
    element.className
  )
}

function getTrackableElement(target) {
  if (!(target instanceof Element)) return null
  return target.closest('a, button, input, select, textarea, summary, [role="button"], [role="link"], [data-analytics]')
}

async function flushQueue() {
  flushTimer = null
  if (!queue.length) return
  const batch = queue.splice(0, MAX_BATCH_SIZE)
  try {
    const { error } = await supabase.from('analytics_events').insert(batch)
    if (error && !error.message?.includes('analytics_events')) {
      console.warn('[analytics] event insert failed:', error.message)
    }
  } catch (error) {
    console.warn('[analytics] event insert exception:', error?.message)
  }
  if (queue.length) scheduleFlush()
}

function scheduleFlush() {
  if (flushTimer || typeof window === 'undefined') return
  flushTimer = window.setTimeout(flushQueue, FLUSH_DELAY_MS)
}

export function trackAnalyticsEvent(eventType, payload = {}) {
  if (typeof window === 'undefined') return
  if (window.location.pathname === '/admin' || window.location.pathname.startsWith('/admin/')) return

  const event = {
    user_id: payload.userId || null,
    session_id: getSessionId(),
    event_type: eventType,
    page_path: window.location.pathname,
    page_url: window.location.href.slice(0, 1000),
    page_title: document.title?.slice(0, 240) || null,
    element_tag: payload.elementTag || null,
    element_role: payload.elementRole || null,
    element_label: payload.elementLabel || null,
    element_id: payload.elementId || null,
    element_classes: payload.elementClasses || null,
    href: payload.href || null,
    metadata: payload.metadata || {},
    user_agent: navigator.userAgent?.slice(0, 500) || null,
  }

  queue.push(event)
  if (queue.length >= MAX_BATCH_SIZE) void flushQueue()
  else scheduleFlush()
}

export function trackPageView(userId) {
  if (typeof window === 'undefined') return
  const key = `${window.location.pathname}${window.location.search}`
  const now = Date.now()
  if (lastPageView.key === key && now - lastPageView.at < 750) return
  lastPageView = { key, at: now }
  trackAnalyticsEvent('page_view', {
    userId,
    metadata: {
      search: window.location.search || null,
      referrer: document.referrer || null,
      viewport: `${window.innerWidth}x${window.innerHeight}`,
    },
  })
}

export function initClickAnalytics(getUserId) {
  if (typeof window === 'undefined') return () => {}

  const onClick = (event) => {
    const element = getTrackableElement(event.target)
    if (!element) return
    const rect = element.getBoundingClientRect()
    trackAnalyticsEvent('click', {
      userId: getUserId?.() || null,
      elementTag: element.tagName.toLowerCase(),
      elementRole: element.getAttribute('role') || null,
      elementLabel: getElementLabel(element),
      elementId: element.id || null,
      elementClasses: trimText(element.className, 300) || null,
      href: element.href || element.getAttribute('href') || null,
      metadata: {
        x: Math.round(event.clientX),
        y: Math.round(event.clientY),
        element_width: Math.round(rect.width),
        element_height: Math.round(rect.height),
        data_analytics: element.getAttribute('data-analytics') || null,
      },
    })
  }

  const flushOnHide = () => { void flushQueue() }

  document.addEventListener('click', onClick, true)
  window.addEventListener('pagehide', flushOnHide)
  return () => {
    document.removeEventListener('click', onClick, true)
    window.removeEventListener('pagehide', flushOnHide)
  }
}