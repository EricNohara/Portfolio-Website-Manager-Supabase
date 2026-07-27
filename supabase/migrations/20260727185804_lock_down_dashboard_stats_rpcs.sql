REVOKE ALL ON FUNCTION public.get_api_log_counts_last_7_days() FROM PUBLIC;
REVOKE ALL ON FUNCTION public.get_api_log_counts_last_7_days() FROM anon;
GRANT EXECUTE ON FUNCTION public.get_api_log_counts_last_7_days() TO authenticated;
GRANT EXECUTE ON FUNCTION public.get_api_log_counts_last_7_days() TO service_role;

REVOKE ALL ON FUNCTION public.get_api_success_failure_counts_last_7_days() FROM PUBLIC;
REVOKE ALL ON FUNCTION public.get_api_success_failure_counts_last_7_days() FROM anon;
GRANT EXECUTE ON FUNCTION public.get_api_success_failure_counts_last_7_days() TO authenticated;
GRANT EXECUTE ON FUNCTION public.get_api_success_failure_counts_last_7_days() TO service_role;

REVOKE ALL ON FUNCTION public.get_top_connection_counts_last_7_days() FROM PUBLIC;
REVOKE ALL ON FUNCTION public.get_top_connection_counts_last_7_days() FROM anon;
GRANT EXECUTE ON FUNCTION public.get_top_connection_counts_last_7_days() TO authenticated;
GRANT EXECUTE ON FUNCTION public.get_top_connection_counts_last_7_days() TO service_role;