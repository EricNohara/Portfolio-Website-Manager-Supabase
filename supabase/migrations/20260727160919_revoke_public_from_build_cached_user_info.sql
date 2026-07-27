REVOKE ALL ON FUNCTION public.build_cached_user_info(uuid) FROM PUBLIC;
REVOKE ALL ON FUNCTION public.build_cached_user_info(uuid) FROM anon;
REVOKE ALL ON FUNCTION public.build_cached_user_info(uuid) FROM authenticated;
GRANT EXECUTE ON FUNCTION public.build_cached_user_info(uuid) TO service_role;