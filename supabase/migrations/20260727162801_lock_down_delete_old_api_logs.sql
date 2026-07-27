REVOKE ALL ON FUNCTION public.delete_old_api_logs() FROM PUBLIC;
REVOKE ALL ON FUNCTION public.delete_old_api_logs() FROM anon;
REVOKE ALL ON FUNCTION public.delete_old_api_logs() FROM authenticated;
GRANT EXECUTE ON FUNCTION public.delete_old_api_logs() TO service_role;