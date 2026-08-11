DROP FUNCTION IF EXISTS public.get_public_cached_user_info(uuid, text, uuid);

CREATE FUNCTION public.get_public_cached_user_info (
  p_key_id uuid,
  p_hashed_key text
)
RETURNS TABLE (
  user_id uuid,
  key_description text,
  user_info jsonb
)
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $function$
DECLARE
  v_key_user_id uuid;
  v_key_description text;
  v_payload jsonb;
BEGIN
  SELECT ak.user_id, ak.description
  INTO v_key_user_id, v_key_description
  FROM public.api_keys ak
  WHERE ak.id = p_key_id
    AND ak.hashed_key = p_hashed_key
    AND (ak.expires IS NULL OR ak.expires > now());

  IF NOT FOUND THEN
    RETURN;
  END IF;

  SELECT cui.payload
  INTO v_payload
  FROM public.cached_user_info cui
  WHERE cui.user_id = v_key_user_id;

  IF v_payload IS NULL THEN
    SELECT public.build_cached_user_info(v_key_user_id)
    INTO v_payload;
  END IF;

  user_id := v_key_user_id;
  key_description := v_key_description;
  user_info := v_payload;
  RETURN NEXT;
END;
$function$;

REVOKE ALL ON FUNCTION public.get_public_cached_user_info(uuid, text) FROM PUBLIC;
REVOKE ALL ON FUNCTION public.get_public_cached_user_info(uuid, text) FROM anon;
REVOKE ALL ON FUNCTION public.get_public_cached_user_info(uuid, text) FROM authenticated;
GRANT EXECUTE ON FUNCTION public.get_public_cached_user_info(uuid, text) TO service_role;
