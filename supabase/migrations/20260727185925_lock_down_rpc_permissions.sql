REVOKE ALL ON FUNCTION public.get_latest_cached_cover_letters() FROM PUBLIC;
REVOKE ALL ON FUNCTION public.get_latest_cached_cover_letters() FROM anon;
GRANT EXECUTE ON FUNCTION public.get_latest_cached_cover_letters() TO authenticated;
GRANT EXECUTE ON FUNCTION public.get_latest_cached_cover_letters() TO service_role;

REVOKE ALL ON FUNCTION public.get_cached_cover_letters_by_session(uuid) FROM PUBLIC;
REVOKE ALL ON FUNCTION public.get_cached_cover_letters_by_session(uuid) FROM anon;
GRANT EXECUTE ON FUNCTION public.get_cached_cover_letters_by_session(uuid) TO authenticated;
GRANT EXECUTE ON FUNCTION public.get_cached_cover_letters_by_session(uuid) TO service_role;

REVOKE ALL ON FUNCTION public.save_cover_letter_revision(uuid, text, text) FROM PUBLIC;
REVOKE ALL ON FUNCTION public.save_cover_letter_revision(uuid, text, text) FROM anon;
GRANT EXECUTE ON FUNCTION public.save_cover_letter_revision(uuid, text, text) TO authenticated;
GRANT EXECUTE ON FUNCTION public.save_cover_letter_revision(uuid, text, text) TO service_role;

REVOKE ALL ON FUNCTION public.get_latest_cached_professional_headshots(uuid) FROM PUBLIC;
REVOKE ALL ON FUNCTION public.get_latest_cached_professional_headshots(uuid) FROM anon;
GRANT EXECUTE ON FUNCTION public.get_latest_cached_professional_headshots(uuid) TO authenticated;
GRANT EXECUTE ON FUNCTION public.get_latest_cached_professional_headshots(uuid) TO service_role;

REVOKE ALL ON FUNCTION public.get_latest_cached_resumes(uuid) FROM PUBLIC;
REVOKE ALL ON FUNCTION public.get_latest_cached_resumes(uuid) FROM anon;
GRANT EXECUTE ON FUNCTION public.get_latest_cached_resumes(uuid) TO authenticated;
GRANT EXECUTE ON FUNCTION public.get_latest_cached_resumes(uuid) TO service_role;

REVOKE ALL ON FUNCTION public.handle_new_user() FROM PUBLIC;
REVOKE ALL ON FUNCTION public.handle_new_user() FROM anon;
REVOKE ALL ON FUNCTION public.handle_new_user() FROM authenticated;
GRANT EXECUTE ON FUNCTION public.handle_new_user() TO service_role;

REVOKE ALL ON FUNCTION public.refresh_cached_user_info(uuid) FROM PUBLIC;
REVOKE ALL ON FUNCTION public.refresh_cached_user_info(uuid) FROM anon;
GRANT EXECUTE ON FUNCTION public.refresh_cached_user_info(uuid) TO authenticated;
GRANT EXECUTE ON FUNCTION public.refresh_cached_user_info(uuid) TO service_role;

REVOKE ALL ON FUNCTION public.log_public_api_request(uuid, timestamp WITHOUT time zone, timestamp WITHOUT time zone, integer, text, text, uuid) FROM PUBLIC;
REVOKE ALL ON FUNCTION public.log_public_api_request(uuid, timestamp WITHOUT time zone, timestamp WITHOUT time zone, integer, text, text, uuid) FROM anon;
REVOKE ALL ON FUNCTION public.log_public_api_request(uuid, timestamp WITHOUT time zone, timestamp WITHOUT time zone, integer, text, text, uuid) FROM authenticated;
GRANT EXECUTE ON FUNCTION public.log_public_api_request(uuid, timestamp WITHOUT time zone, timestamp WITHOUT time zone, integer, text, text, uuid) TO service_role;

REVOKE ALL ON FUNCTION public.get_user_info_internal(uuid) FROM PUBLIC;
REVOKE ALL ON FUNCTION public.get_user_info_internal(uuid) FROM anon;
GRANT EXECUTE ON FUNCTION public.get_user_info_internal(uuid) TO authenticated;
GRANT EXECUTE ON FUNCTION public.get_user_info_internal(uuid) TO service_role;