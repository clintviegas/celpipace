-- Contact/support messages submitted from /contact.

CREATE TABLE IF NOT EXISTS public.contact_messages (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  request_type TEXT NOT NULL DEFAULT 'Ask a question',
  section TEXT NOT NULL DEFAULT 'Not section-specific',
  urgency TEXT NOT NULL DEFAULT 'Normal',
  name TEXT,
  email TEXT,
  message TEXT NOT NULL,
  user_agent TEXT,
  status TEXT NOT NULL DEFAULT 'new',
  email_sent BOOLEAN NOT NULL DEFAULT FALSE,
  email_error TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_contact_messages_created_at
  ON public.contact_messages(created_at DESC);

CREATE INDEX IF NOT EXISTS idx_contact_messages_user
  ON public.contact_messages(user_id, created_at DESC)
  WHERE user_id IS NOT NULL;

ALTER TABLE public.contact_messages ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "contact_insert_anyone" ON public.contact_messages;
CREATE POLICY "contact_insert_anyone" ON public.contact_messages
  FOR INSERT WITH CHECK (user_id IS NULL OR auth.uid() = user_id);

DROP POLICY IF EXISTS "contact_select_own" ON public.contact_messages;
CREATE POLICY "contact_select_own" ON public.contact_messages
  FOR SELECT USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "contact_admin_select" ON public.contact_messages;
CREATE POLICY "contact_admin_select" ON public.contact_messages
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM auth.users u
      WHERE u.id = auth.uid() AND u.email = 'sales@celpipace.com'
    )
  );