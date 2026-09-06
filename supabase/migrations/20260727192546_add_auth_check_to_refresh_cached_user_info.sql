CREATE OR REPLACE FUNCTION public.refresh_cached_user_info (
  p_user_id uuid
)
RETURNS jsonb
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $function$
declare
  v_payload jsonb;
  v_has_active_key boolean;
begin
  if auth.uid() is null or auth.uid() <> p_user_id then
    raise exception 'Unauthorized';
  end if;
  select exists (
    select 1
    from public.api_keys ak
    where ak.user_id = p_user_id
      and (ak.expires is null or ak.expires > now())
  )
  into v_has_active_key;

  if not v_has_active_key then
    delete from public.cached_user_info
    where user_id = p_user_id;

    return null;
  end if;

  v_payload := public.build_cached_user_info(p_user_id);

  if v_payload is null then
    delete from public.cached_user_info
    where user_id = p_user_id;

    return null;
  end if;

  insert into public.cached_user_info (user_id, payload, updated_at)
  values (p_user_id, v_payload, now())
  on conflict (user_id)
  do update set
    payload = excluded.payload,
    updated_at = excluded.updated_at;

  return v_payload;
end;
$function$;

REVOKE ALL ON FUNCTION public.refresh_cached_user_info(uuid) FROM PUBLIC;
REVOKE ALL ON FUNCTION public.refresh_cached_user_info(uuid) FROM anon;
GRANT EXECUTE ON FUNCTION public.refresh_cached_user_info(uuid) TO authenticated;
GRANT EXECUTE ON FUNCTION public.refresh_cached_user_info(uuid) TO service_role;