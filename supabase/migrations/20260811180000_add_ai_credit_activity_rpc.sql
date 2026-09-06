-- Return a seven-day AI credit activity series for the authenticated user.
-- The browser supplies only its IANA timezone; the user ID always comes from
-- the authenticated Supabase session.
CREATE OR REPLACE FUNCTION public.get_ai_credit_activity_last_7_days(
  p_timezone text DEFAULT 'UTC'
)
RETURNS TABLE (
  day date,
  credits_added bigint,
  credits_used bigint
)
LANGUAGE plpgsql
STABLE
SECURITY INVOKER
SET search_path TO ''
AS $function$
DECLARE
  v_user_id uuid := (SELECT auth.uid());
  v_timezone text := COALESCE(NULLIF(btrim(p_timezone), ''), 'UTC');
BEGIN
  IF v_user_id IS NULL THEN
    RAISE EXCEPTION USING
      ERRCODE = '42501',
      MESSAGE = 'authentication_required';
  END IF;

  IF length(v_timezone) > 64 OR NOT EXISTS (
    SELECT 1
    FROM pg_catalog.pg_timezone_names
    WHERE name = v_timezone
  ) THEN
    RAISE EXCEPTION USING
      ERRCODE = '22023',
      MESSAGE = 'invalid_timezone';
  END IF;

  RETURN QUERY
  WITH bounds AS (
    SELECT
      ((now() AT TIME ZONE v_timezone)::date - 6) AS start_day,
      (now() AT TIME ZONE v_timezone)::date AS end_day
  ),
  days AS (
    SELECT generate_series(
      bounds.start_day::timestamp,
      bounds.end_day::timestamp,
      interval '1 day'
    )::date AS activity_day
    FROM bounds
  ),
  activity AS (
    SELECT
      (ledger.created_at AT TIME ZONE v_timezone)::date AS activity_day,
      (ledger.subscription_delta + ledger.lifetime_delta)::bigint AS total_delta
    FROM public.ai_credit_ledger AS ledger
    CROSS JOIN bounds
    WHERE ledger.user_id = v_user_id
      AND ledger.created_at >= (
        bounds.start_day::timestamp AT TIME ZONE v_timezone
      )
      AND ledger.created_at < (
        (bounds.end_day + 1)::timestamp AT TIME ZONE v_timezone
      )
  )
  SELECT
    days.activity_day,
    COALESCE(
      SUM(activity.total_delta) FILTER (WHERE activity.total_delta > 0),
      0
    )::bigint AS credits_added,
    COALESCE(
      SUM(-activity.total_delta) FILTER (WHERE activity.total_delta < 0),
      0
    )::bigint AS credits_used
  FROM days
  LEFT JOIN activity USING (activity_day)
  GROUP BY days.activity_day
  ORDER BY days.activity_day;
END;
$function$;

REVOKE ALL ON FUNCTION public.get_ai_credit_activity_last_7_days(text) FROM PUBLIC;
REVOKE ALL ON FUNCTION public.get_ai_credit_activity_last_7_days(text) FROM anon;
GRANT EXECUTE ON FUNCTION public.get_ai_credit_activity_last_7_days(text) TO authenticated;
