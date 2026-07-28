REVOKE ALL ON FUNCTION public.get_api_latency_last_7_days() FROM PUBLIC;
REVOKE ALL ON FUNCTION public.get_api_latency_last_7_days() FROM anon;
GRANT EXECUTE ON FUNCTION public.get_api_latency_last_7_days() TO authenticated;
GRANT EXECUTE ON FUNCTION public.get_api_latency_last_7_days() TO service_role;

ALTER DEFAULT PRIVILEGES FOR ROLE postgres IN SCHEMA public
  REVOKE ALL ON ROUTINES FROM anon;
