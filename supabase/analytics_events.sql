-- ==========================================================================
-- Detailed site analytics: page views and click events for /admin Analytics.
-- Safe to re-run.
-- ==========================================================================

CREATE TABLE IF NOT EXISTS public.analytics_events (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  session_id TEXT NOT NULL,
  event_type TEXT NOT NULL CHECK (event_type IN ('page_view', 'click')),
  page_path TEXT,
  page_url TEXT,
  page_title TEXT,
  element_tag TEXT,
  element_role TEXT,
  element_label TEXT,
  element_id TEXT,
  element_classes TEXT,
  href TEXT,
  metadata JSONB NOT NULL DEFAULT '{}'::jsonb,
  user_agent TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_analytics_events_created_at
  ON public.analytics_events(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_analytics_events_user_created
  ON public.analytics_events(user_id, created_at DESC);
CREATE INDEX IF NOT EXISTS idx_analytics_events_type_created
  ON public.analytics_events(event_type, created_at DESC);
CREATE INDEX IF NOT EXISTS idx_analytics_events_page_created
  ON public.analytics_events(page_path, created_at DESC);
CREATE INDEX IF NOT EXISTS idx_analytics_events_session_created
  ON public.analytics_events(session_id, created_at DESC);

ALTER TABLE public.analytics_events ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Clients insert analytics events" ON public.analytics_events;
DROP POLICY IF EXISTS "Admin reads all analytics events" ON public.analytics_events;

CREATE POLICY "Clients insert analytics events"
  ON public.analytics_events FOR INSERT
  TO anon, authenticated
  WITH CHECK (user_id IS NULL OR auth.uid() = user_id);

CREATE POLICY "Admin reads all analytics events"
  ON public.analytics_events FOR SELECT
  TO authenticated
  USING (public.is_app_admin());

GRANT INSERT ON public.analytics_events TO anon, authenticated;
GRANT SELECT ON public.analytics_events TO authenticated;
