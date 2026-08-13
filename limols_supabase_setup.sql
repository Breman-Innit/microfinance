-- LIMOL'S MICROFINANCE - SUPABASE SECURITY SETUP
-- Run this in Supabase SQL Editor after creating the Auth user.

-- 1) RLS
ALTER TABLE public.members ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.payments ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.withdrawals ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.admins ENABLE ROW LEVEL SECURITY;

-- 2) Data API privileges for authenticated admins
GRANT SELECT, INSERT, UPDATE, DELETE ON public.members TO authenticated;
GRANT SELECT, INSERT, UPDATE, DELETE ON public.payments TO authenticated;
GRANT SELECT, INSERT, UPDATE, DELETE ON public.withdrawals TO authenticated;
GRANT SELECT ON public.admins TO authenticated;

-- Identity/serial sequences used by inserts.
GRANT USAGE, SELECT ON ALL SEQUENCES IN SCHEMA public TO authenticated;

-- 3) Policies
DROP POLICY IF EXISTS "Authenticated admins can manage members" ON public.members;
CREATE POLICY "Authenticated admins can manage members"
ON public.members
FOR ALL
TO authenticated
USING (true)
WITH CHECK (true);

DROP POLICY IF EXISTS "Authenticated admins can manage payments" ON public.payments;
CREATE POLICY "Authenticated admins can manage payments"
ON public.payments
FOR ALL
TO authenticated
USING (true)
WITH CHECK (true);

DROP POLICY IF EXISTS "Authenticated admins can manage withdrawals" ON public.withdrawals;
CREATE POLICY "Authenticated admins can manage withdrawals"
ON public.withdrawals
FOR ALL
TO authenticated
USING (true)
WITH CHECK (true);

DROP POLICY IF EXISTS "Authenticated users can read admins" ON public.admins;
CREATE POLICY "Authenticated users can read admins"
ON public.admins
FOR SELECT
TO authenticated
USING (true);

-- 4) The old admins.password_hash is NOT used for authentication.
-- Supabase Auth handles the admin password. Replace the demo plaintext value.
UPDATE public.admins
SET password_hash = 'MANAGED_BY_SUPABASE_AUTH'
WHERE email = 'admin@limolsmicrofinance.com';

-- OPTIONAL: if you want image URLs later, add this before using image_url in the frontend:
-- ALTER TABLE public.members ADD COLUMN IF NOT EXISTS image_url TEXT;
