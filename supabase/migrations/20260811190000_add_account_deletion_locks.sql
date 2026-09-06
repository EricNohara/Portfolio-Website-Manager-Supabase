-- A short-lived server-managed lock prevents new user mutations from racing
-- with cross-system account cleanup. The row is removed automatically when
-- the Auth user is deleted and is cleared by the server when cleanup fails.
CREATE TABLE public.account_deletion_locks (
  user_id uuid PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  created_at timestamptz NOT NULL DEFAULT now()
);

ALTER TABLE public.account_deletion_locks ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view their own account deletion lock"
  ON public.account_deletion_locks
  FOR SELECT
  TO authenticated
  USING ((SELECT auth.uid()) = user_id);

REVOKE ALL PRIVILEGES ON public.account_deletion_locks
  FROM PUBLIC, anon, authenticated;

GRANT SELECT ON public.account_deletion_locks TO authenticated;
GRANT ALL PRIVILEGES ON public.account_deletion_locks TO service_role;
