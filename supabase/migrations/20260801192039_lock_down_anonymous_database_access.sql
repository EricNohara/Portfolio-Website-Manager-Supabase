-- P01: remove direct database access from the anonymous Data API role.
-- Public profile data must be served through the authenticated API-key route,
-- not through direct table or RPC access.

REVOKE ALL PRIVILEGES ON ALL TABLES IN SCHEMA public FROM anon;
REVOKE ALL PRIVILEGES ON ALL SEQUENCES IN SCHEMA public FROM anon;
REVOKE ALL PRIVILEGES ON ALL ROUTINES IN SCHEMA public FROM anon;

-- Anonymous also inherits privileges granted to PUBLIC. Remove any existing
-- PUBLIC object grants so they cannot silently preserve anonymous access.
REVOKE ALL PRIVILEGES ON ALL TABLES IN SCHEMA public FROM PUBLIC;
REVOKE ALL PRIVILEGES ON ALL SEQUENCES IN SCHEMA public FROM PUBLIC;
REVOKE ALL PRIVILEGES ON ALL ROUTINES IN SCHEMA public FROM PUBLIC;

ALTER DEFAULT PRIVILEGES FOR ROLE postgres IN SCHEMA public
  REVOKE ALL PRIVILEGES ON TABLES FROM anon;

ALTER DEFAULT PRIVILEGES FOR ROLE postgres IN SCHEMA public
  REVOKE ALL PRIVILEGES ON SEQUENCES FROM anon;

ALTER DEFAULT PRIVILEGES FOR ROLE postgres IN SCHEMA public
  REVOKE ALL PRIVILEGES ON ROUTINES FROM anon;

ALTER DEFAULT PRIVILEGES FOR ROLE postgres IN SCHEMA public
  REVOKE ALL PRIVILEGES ON TABLES FROM PUBLIC;

ALTER DEFAULT PRIVILEGES FOR ROLE postgres IN SCHEMA public
  REVOKE ALL PRIVILEGES ON SEQUENCES FROM PUBLIC;

-- PostgreSQL grants EXECUTE on new routines to PUBLIC by default. Revoke it
-- explicitly because anon inherits PUBLIC privileges.
ALTER DEFAULT PRIVILEGES FOR ROLE postgres IN SCHEMA public
  REVOKE EXECUTE ON ROUTINES FROM PUBLIC;

-- These legacy policies were named as read policies but omitted FOR SELECT,
-- which made them apply to every command and every role. Replace them with
-- authenticated, owner-scoped policies.

DROP POLICY IF EXISTS "Enable read access for all users" ON public.api_keys;
CREATE POLICY "Users can manage their own API keys"
  ON public.api_keys
  TO authenticated
  USING ((SELECT auth.uid()) = user_id)
  WITH CHECK ((SELECT auth.uid()) = user_id);

DROP POLICY IF EXISTS "Enable read access for all users" ON public.cached_professional_headshots;
CREATE POLICY "Users can manage their own cached professional headshots"
  ON public.cached_professional_headshots
  TO authenticated
  USING ((SELECT auth.uid()) = user_id)
  WITH CHECK ((SELECT auth.uid()) = user_id);

DROP POLICY IF EXISTS "Enable read access for all users" ON public.cached_resumes;
CREATE POLICY "Users can manage their own cached resumes"
  ON public.cached_resumes
  TO authenticated
  USING ((SELECT auth.uid()) = user_id)
  WITH CHECK ((SELECT auth.uid()) = user_id);

DROP POLICY IF EXISTS "Enable read access for all users" ON public.course;
CREATE POLICY "Users can manage their own courses"
  ON public.course
  TO authenticated
  USING ((SELECT auth.uid()) = user_id)
  WITH CHECK ((SELECT auth.uid()) = user_id);

DROP POLICY IF EXISTS "Enable read access for all users" ON public.cover_letter_sessions;
CREATE POLICY "Users can manage their own cover letter sessions"
  ON public.cover_letter_sessions
  TO authenticated
  USING ((SELECT auth.uid()) = user_id)
  WITH CHECK ((SELECT auth.uid()) = user_id);

DROP POLICY IF EXISTS "Enable read access for all users" ON public.skills;
CREATE POLICY "Users can manage their own skills"
  ON public.skills
  TO authenticated
  USING ((SELECT auth.uid()) = user_id)
  WITH CHECK ((SELECT auth.uid()) = user_id);

DROP POLICY IF EXISTS "Enable read access for all users" ON public.work_experiences;
CREATE POLICY "Users can manage their own work experiences"
  ON public.work_experiences
  TO authenticated
  USING ((SELECT auth.uid()) = user_id)
  WITH CHECK ((SELECT auth.uid()) = user_id);
