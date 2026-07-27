CREATE OR REPLACE FUNCTION public.get_user_info_internal (
  p_user_id uuid
)
RETURNS jsonb
LANGUAGE plpgsql
STABLE
SECURITY DEFINER
SET search_path = public
AS $function$
begin
  if auth.uid() is null or auth.uid() <> p_user_id then
    raise exception 'Unauthorized';
  end if;

  return (
    with user_base as (
      select jsonb_build_object(
        'name', u.name,
        'phone_number', u.phone_number,
        'email', u.email,
        'github_url', u.github_url,
        'linkedin_url', u.linkedin_url,
        'portrait_url', u.portrait_url,
        'resume_url', u.resume_url,
        'transcript_url', u.transcript_url,
        'instagram_url', u.instagram_url,
        'facebook_url', u.facebook_url,
        'x_url', u.x_url,
        'bio', u.bio,
        'current_position', u.current_position,
        'current_company', u.current_company,
        'current_address', u.current_address
      ) as obj
      from public.users u
      where u.id = p_user_id
    ),
    skills_json as (
      select coalesce(
        jsonb_agg(
          jsonb_build_object(
            'id', s.id,
            'name', s.name,
            'proficiency', s.proficiency,
            'years_of_experience', s.years_of_experience
          )
          order by s.name
        ),
        '[]'::jsonb
      ) as arr
      from public.skills s
      where s.user_id = p_user_id
    ),
    experiences_json as (
      select coalesce(
        jsonb_agg(
          jsonb_build_object(
            'id', w.id,
            'company', w.company,
            'job_title', w.job_title,
            'date_start', w.date_start,
            'date_end', w.date_end,
            'job_description', w.job_description
          )
          order by w.date_start desc nulls last
        ),
        '[]'::jsonb
      ) as arr
      from public.work_experiences w
      where w.user_id = p_user_id
    ),
    projects_json as (
      select coalesce(
        jsonb_agg(
          jsonb_build_object(
            'id', p.id,
            'name', p.name,
            'date_start', p.date_start,
            'date_end', p.date_end,
            'languages_used', p.languages_used,
            'frameworks_used', p.frameworks_used,
            'technologies_used', p.technologies_used,
            'description', p.description,
            'github_url', p.github_url,
            'demo_url', p.demo_url,
            'thumbnail_url', p.thumbnail_url
          )
          order by p.date_start desc nulls last
        ),
        '[]'::jsonb
      ) as arr
      from public.projects p
      where p.user_id = p_user_id
    ),
    education_json as (
      select coalesce(
        jsonb_agg(
          (to_jsonb(e) - 'user_id') || jsonb_build_object(
            'courses',
            coalesce((
              select jsonb_agg(
                jsonb_build_object(
                  'id', c.id,
                  'name', c.name,
                  'grade', c.grade,
                  'description', c.description
                )
                order by c.name
              )
              from public.course c
              where c.user_id = p_user_id
                and c.education_id = e.id
            ), '[]'::jsonb)
          )
          order by e.year_start desc nulls last
        ),
        '[]'::jsonb
      ) as arr
      from public.education e
      where e.user_id = p_user_id
    ),
    api_keys_json as (
      select coalesce(
        jsonb_agg(
          jsonb_build_object(
            'id', k.id,
            'created', k.created,
            'expires', k.expires,
            'description', k.description,
            'last_used', k.last_used
          )
          order by k.created desc
        ),
        '[]'::jsonb
      ) as arr
      from public.api_keys k
      where k.user_id = p_user_id
    ),
    public_api_logs_json as (
      select coalesce(
        jsonb_agg(
          jsonb_build_object(
            'key_description', l.key_description,
            'user_agent', l.user_agent,
            'requested_at', l.requested_at,
            'responded_at', l.responded_at,
            'status_code', l.status_code
          )
          order by l.requested_at desc
        ),
        '[]'::jsonb
      ) as arr
      from public.public_api_logs l
      where l.user_id = p_user_id
    )
    select
      coalesce(user_base.obj, '{}'::jsonb)
      || jsonb_build_object(
        'skills', skills_json.arr,
        'experiences', experiences_json.arr,
        'projects', projects_json.arr,
        'education', education_json.arr,
        'api_keys', api_keys_json.arr,
        'public_api_logs', public_api_logs_json.arr
      )
    from user_base
    cross join skills_json
    cross join experiences_json
    cross join projects_json
    cross join education_json
    cross join api_keys_json
    cross join public_api_logs_json
  );
end;
$function$;

REVOKE ALL ON FUNCTION public.get_user_info_internal(uuid) FROM PUBLIC;
REVOKE ALL ON FUNCTION public.get_user_info_internal(uuid) FROM anon;
GRANT EXECUTE ON FUNCTION public.get_user_info_internal(uuid) TO authenticated;
GRANT EXECUTE ON FUNCTION public.get_user_info_internal(uuid) TO service_role;