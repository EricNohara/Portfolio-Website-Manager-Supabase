REVOKE ALL ON FUNCTION public.get_api_latency_samples_last_7_days() FROM PUBLIC;
REVOKE ALL ON FUNCTION public.get_api_latency_samples_last_7_days() FROM anon;
GRANT EXECUTE ON FUNCTION public.get_api_latency_samples_last_7_days() TO authenticated;
GRANT EXECUTE ON FUNCTION public.get_api_latency_samples_last_7_days() TO service_role;