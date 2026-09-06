-- Migration unit 1: schema_changes
-- Transaction mode: transactional
-- Boundary reason: default

SET check_function_bodies = false;

ALTER DEFAULT PRIVILEGES FOR ROLE postgres IN SCHEMA public GRANT DELETE, INSERT, SELECT, UPDATE ON TABLES TO anon;

ALTER DEFAULT PRIVILEGES FOR ROLE postgres IN SCHEMA public GRANT SELECT, USAGE ON SEQUENCES TO anon;

ALTER DEFAULT PRIVILEGES FOR ROLE postgres IN SCHEMA public GRANT ALL ON ROUTINES TO anon;

ALTER DEFAULT PRIVILEGES FOR ROLE postgres IN SCHEMA public GRANT DELETE, INSERT, SELECT, UPDATE ON TABLES TO authenticated;

ALTER DEFAULT PRIVILEGES FOR ROLE postgres IN SCHEMA public GRANT SELECT, USAGE ON SEQUENCES TO authenticated;

ALTER DEFAULT PRIVILEGES FOR ROLE postgres IN SCHEMA public GRANT ALL ON ROUTINES TO authenticated;

ALTER DEFAULT PRIVILEGES FOR ROLE postgres IN SCHEMA public GRANT DELETE, INSERT, SELECT, UPDATE ON TABLES TO service_role;

ALTER DEFAULT PRIVILEGES FOR ROLE postgres IN SCHEMA public GRANT SELECT, USAGE ON SEQUENCES TO service_role;

ALTER DEFAULT PRIVILEGES FOR ROLE postgres IN SCHEMA public GRANT ALL ON ROUTINES TO service_role;

CREATE FUNCTION public.build_cached_user_info (
  p_user_id uuid
)
  RETURNS jsonb
  LANGUAGE sql
  STABLE
  AS $function$with user_base as (
  select jsonb_build_object(
    'name', u.name,
    'phone_number', u.phone_number,
    'email', u.email,
    'current_address', u.current_address,
    'github_url', u.github_url,
    'linkedin_url', u.linkedin_url,
    'portrait_url', u.portrait_url,
    'resume_url', u.resume_url,
    'transcript_url', u.transcript_url,
    'instagram_url', u.instagram_url,
    'facebook_url', u.facebook_url,
    'bio', u.bio,
    'current_position', u.current_position,
    'x_url', u.x_url,
    'current_company', u.current_company
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
      order by w.date_start desc nulls last, w.company desc
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
      order by p.date_start desc nulls last, p.id desc
    ),
    '[]'::jsonb
  ) as arr
  from public.projects p
  where p.user_id = p_user_id
),
education_json as (
  select coalesce(
    jsonb_agg(
      jsonb_build_object(
        'id', e.id,
        'degree', e.degree,
        'majors', e.majors,
        'minors', e.minors,
        'gpa', e.gpa,
        'institution', e.institution,
        'awards', e.awards,
        'year_start', e.year_start,
        'year_end', e.year_end,
        'courses', coalesce((
          select jsonb_agg(
            jsonb_build_object(
              'id', c.id,
              'name', c.name,
              'grade', c.grade,
              'description', c.description
            )
            order by c.grade
          )
          from public.course c
          where c.user_id = p_user_id
            and c.education_id = e.id
        ), '[]'::jsonb)
      )
      order by e.year_start desc nulls last, e.id desc
    ),
    '[]'::jsonb
  ) as arr
  from public.education e
  where e.user_id = p_user_id
),
subscription_json as (
  select coalesce(
    jsonb_build_object(
      'status', s.status,
      'price_id', s.price_id
    ),
    'null'::jsonb
  ) as obj
  from public.subscriptions s
  where s.user_id = p_user_id
)
select
  ub.obj
  || jsonb_build_object(
    'skills', sj.arr,
    'experiences', ej.arr,
    'projects', pj.arr,
    'education', edj.arr,
    'subscription', coalesce(sub.obj, 'null'::jsonb)
  )
from user_base ub
cross join skills_json sj
cross join experiences_json ej
cross join projects_json pj
cross join education_json edj
left join subscription_json sub on true;$function$;

GRANT ALL ON FUNCTION public.build_cached_user_info(uuid) TO anon;

GRANT ALL ON FUNCTION public.build_cached_user_info(uuid) TO authenticated;

GRANT ALL ON FUNCTION public.build_cached_user_info(uuid) TO service_role;

CREATE FUNCTION public.delete_old_api_logs()
  RETURNS void
  LANGUAGE plpgsql
  SECURITY DEFINER
  AS $function$
BEGIN
    SET search_path TO public, pg_temp;
    DELETE FROM public_api_logs
    WHERE created_at < NOW() - INTERVAL '7 days';
END;
$function$;

GRANT ALL ON FUNCTION public.delete_old_api_logs() TO anon;

GRANT ALL ON FUNCTION public.delete_old_api_logs() TO authenticated;

GRANT ALL ON FUNCTION public.delete_old_api_logs() TO service_role;

CREATE FUNCTION public.get_api_latency_last_7_days()
  RETURNS TABLE (
    day    date,
    avg_ms numeric,
    p95_ms numeric
  )
  LANGUAGE sql
  SET search_path TO 'public'
  AS $function$
  with logs as (
    select
      date_trunc('day', requested_at)::date as day,
      extract(epoch from (responded_at - requested_at)) * 1000 as latency_ms
    from public_api_logs
    where user_id = auth.uid()
      and requested_at >= (now() - interval '7 days')
      and responded_at is not null
      and requested_at is not null
      and responded_at >= requested_at
  )
  select
    day,
    round(avg(latency_ms)::numeric, 1) as avg_ms,
    round(
      percentile_cont(0.95) within group (order by latency_ms)::numeric,
      1
    ) as p95_ms
  from logs
  group by day
  order by day;
$function$;

GRANT ALL ON FUNCTION public.get_api_latency_last_7_days() TO anon;

GRANT ALL ON FUNCTION public.get_api_latency_last_7_days() TO authenticated;

GRANT ALL ON FUNCTION public.get_api_latency_last_7_days() TO service_role;

CREATE FUNCTION public.get_api_latency_samples_last_7_days()
  RETURNS TABLE (
    latency_ms integer
  )
  LANGUAGE sql
  SECURITY DEFINER
  SET search_path TO 'public'
  AS $function$
  select
    greatest(
      0,
      round(extract(epoch from (responded_at - requested_at)) * 1000)
    )::int as latency_ms
  from public_api_logs
  where user_id = auth.uid()
    and requested_at >= (now() - interval '7 days')
    and responded_at is not null
    and requested_at is not null;
$function$;

GRANT ALL ON FUNCTION public.get_api_latency_samples_last_7_days() TO anon;

GRANT ALL ON FUNCTION public.get_api_latency_samples_last_7_days() TO authenticated;

GRANT ALL ON FUNCTION public.get_api_latency_samples_last_7_days() TO service_role;

CREATE FUNCTION public.get_api_log_counts_last_7_days()
  RETURNS TABLE (
    day     date,
    success bigint,
    failed  bigint
  )
  LANGUAGE sql
  AS $function$
  select
    (requested_at at time zone 'UTC')::date as day,
    count(*) filter (where status_code between 200 and 299) as success,
    count(*) filter (where status_code < 200 or status_code >= 300) as failed
  from public.public_api_logs
  where user_id = auth.uid()
    and requested_at >= (now() at time zone 'UTC') - interval '7 days'
  group by day
  order by day;
$function$;

GRANT ALL ON FUNCTION public.get_api_log_counts_last_7_days() TO anon;

GRANT ALL ON FUNCTION public.get_api_log_counts_last_7_days() TO authenticated;

GRANT ALL ON FUNCTION public.get_api_log_counts_last_7_days() TO service_role;

CREATE FUNCTION public.get_api_success_failure_counts_last_7_days()
  RETURNS TABLE (
    success bigint,
    failed  bigint
  )
  LANGUAGE sql
  STABLE
  SET search_path TO 'public'
  AS $function$
  select
    count(*) filter (where status_code between 200 and 299) as success,
    count(*) filter (where status_code not between 200 and 299) as failed
  from public.public_api_logs
  where user_id = auth.uid()
    and requested_at >= (now() - interval '7 days');
$function$;

GRANT ALL ON FUNCTION public.get_api_success_failure_counts_last_7_days() TO anon;

GRANT ALL ON FUNCTION public.get_api_success_failure_counts_last_7_days() TO authenticated;

GRANT ALL ON FUNCTION public.get_api_success_failure_counts_last_7_days() TO service_role;

CREATE FUNCTION public.get_latest_cached_cover_letters()
  RETURNS TABLE (
    job_title    text,
    company_name text,
    session_id   uuid,
    created_at   timestamp with time zone
  )
  LANGUAGE sql
  AS $function$
  select distinct on (session_id)
    job_title,
    company_name,
    session_id,
    created_at
  from public.cached_cover_letters
  where user_id = auth.uid()
  order by session_id, created_at desc;
$function$;

GRANT ALL ON FUNCTION public.get_latest_cached_cover_letters() TO anon;

GRANT ALL ON FUNCTION public.get_latest_cached_cover_letters() TO authenticated;

GRANT ALL ON FUNCTION public.get_latest_cached_cover_letters() TO service_role;

CREATE FUNCTION public.get_public_cached_user_info (
  p_key_id         uuid,
  p_hashed_key     text,
  p_target_user_id uuid DEFAULT NULL::uuid
)
  RETURNS TABLE (
    user_id         uuid,
    key_description text,
    user_info       jsonb
  )
  LANGUAGE plpgsql
  SECURITY DEFINER
  AS $function$declare
  v_key_user_id uuid;
  v_key_description text;
  v_effective_user_id uuid;
  v_payload jsonb;
begin
  select ak.user_id, ak.description
  into v_key_user_id, v_key_description
  from public.api_keys ak
  where ak.id = p_key_id
    and ak.hashed_key = p_hashed_key
    and (ak.expires is null or ak.expires > now());

  if not found then
    return;
  end if;

  if v_key_description = 'Nukleio Super Key' then
    if p_target_user_id is null then
      return;
    end if;
    v_effective_user_id := p_target_user_id;
  else
    v_effective_user_id := v_key_user_id;
  end if;

  select cui.payload
  into v_payload
  from public.cached_user_info cui
  where cui.user_id = v_effective_user_id;

  if v_payload is null then
    select public.build_cached_user_info(v_effective_user_id)
    into v_payload;
  end if;

  user_id := v_effective_user_id;
  key_description := v_key_description;
  user_info := v_payload;
  return next;
end;$function$;

GRANT ALL ON FUNCTION public.get_public_cached_user_info(uuid, text, uuid) TO anon;

GRANT ALL ON FUNCTION public.get_public_cached_user_info(uuid, text, uuid) TO authenticated;

GRANT ALL ON FUNCTION public.get_public_cached_user_info(uuid, text, uuid) TO service_role;

CREATE FUNCTION public.get_top_connection_counts_last_7_days()
  RETURNS TABLE (
    name  text,
    count bigint
  )
  LANGUAGE sql
  AS $function$
  select
    coalesce(key_description, 'Unknown') as name,
    count(*)::bigint as count
  from public.public_api_logs
  where user_id = auth.uid()
    and requested_at >= (now() at time zone 'utc') - interval '7 days'
  group by 1
  order by count desc;
$function$;

GRANT ALL ON FUNCTION public.get_top_connection_counts_last_7_days() TO anon;

GRANT ALL ON FUNCTION public.get_top_connection_counts_last_7_days() TO authenticated;

GRANT ALL ON FUNCTION public.get_top_connection_counts_last_7_days() TO service_role;

CREATE FUNCTION public.get_user_info_internal (
  p_user_id uuid
)
  RETURNS jsonb
  LANGUAGE sql
  STABLE
  AS $function$with user_base as (
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
      (
        to_jsonb(e) - 'user_id'
      ) || jsonb_build_object(
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
cross join public_api_logs_json;$function$;

GRANT ALL ON FUNCTION public.get_user_info_internal(uuid) TO anon;

GRANT ALL ON FUNCTION public.get_user_info_internal(uuid) TO authenticated;

GRANT ALL ON FUNCTION public.get_user_info_internal(uuid) TO service_role;

CREATE FUNCTION public.handle_new_user()
  RETURNS TRIGGER
  LANGUAGE plpgsql
  SECURITY DEFINER
  SET search_path TO ''
  AS $function$
BEGIN
  INSERT INTO public.users (id, email)
  VALUES (NEW.id, NEW.email);
  RETURN NEW;
END;
$function$;

CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW
  EXECUTE FUNCTION public.handle_new_user();

GRANT ALL ON FUNCTION public.handle_new_user() TO anon;

GRANT ALL ON FUNCTION public.handle_new_user() TO authenticated;

GRANT ALL ON FUNCTION public.handle_new_user() TO service_role;

CREATE FUNCTION public.log_public_api_request (
  p_user_id         uuid,
  p_requested_at    timestamp without time zone,
  p_responded_at    timestamp without time zone,
  p_status_code     integer,
  p_key_description text,
  p_user_agent      text,
  p_key_id          uuid
)
  RETURNS void
  LANGUAGE plpgsql
  SECURITY DEFINER
  SET search_path TO 'public'
  AS $function$begin
  insert into public.public_api_logs (
    user_id,
    requested_at,
    responded_at,
    status_code,
    key_description,
    user_agent
  )
  values (
    p_user_id,
    p_requested_at,
    p_responded_at,
    p_status_code,
    coalesce(nullif(trim(p_key_description), ''), 'Unknown'),
    coalesce(nullif(trim(p_user_agent), ''), 'unknown')
  );

  if p_key_id is not null then
    update public.api_keys
    set last_used = p_requested_at
    where id = p_key_id;
  end if;
end;$function$;

GRANT ALL ON FUNCTION public.log_public_api_request(uuid, timestamp WITHOUT time zone, timestamp WITHOUT time zone, integer, text, text, uuid) TO anon;

GRANT ALL ON FUNCTION public.log_public_api_request(uuid, timestamp WITHOUT time zone, timestamp WITHOUT time zone, integer, text, text, uuid) TO authenticated;

GRANT ALL ON FUNCTION public.log_public_api_request(uuid, timestamp WITHOUT time zone, timestamp WITHOUT time zone, integer, text, text, uuid) TO service_role;

CREATE FUNCTION public.refresh_cached_user_info (
  p_user_id uuid
)
  RETURNS jsonb
  LANGUAGE plpgsql
  SECURITY DEFINER
  AS $function$
declare
  v_payload jsonb;
  v_has_active_key boolean;
begin
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

GRANT ALL ON FUNCTION public.refresh_cached_user_info(uuid) TO anon;

GRANT ALL ON FUNCTION public.refresh_cached_user_info(uuid) TO authenticated;

GRANT ALL ON FUNCTION public.refresh_cached_user_info(uuid) TO service_role;

CREATE TABLE public.api_keys (
  id          uuid                     DEFAULT gen_random_uuid() NOT NULL,
  user_id     uuid                     NOT NULL,
  hashed_key  text                     NOT NULL,
  description text                     NOT NULL,
  created     timestamp with time zone DEFAULT now() NOT NULL,
  expires     timestamp with time zone,
  last_used   timestamp with time zone
);

ALTER TABLE public.api_keys
  ENABLE ROW LEVEL SECURITY;

ALTER TABLE public.api_keys
  ADD CONSTRAINT api_keys_rework_pkey PRIMARY KEY (id);

ALTER TABLE public.api_keys
  ADD CONSTRAINT api_keys_user_description_key UNIQUE (user_id, description);

GRANT ALL ON public.api_keys TO anon;

GRANT ALL ON public.api_keys TO authenticated;

GRANT ALL ON public.api_keys TO service_role;

CREATE INDEX api_keys_user_id_idx ON public.api_keys (user_id);

CREATE POLICY "Enable read access for all users" ON public.api_keys
  USING (true);

CREATE TABLE public.cached_cover_letters (
  id                   uuid                     DEFAULT gen_random_uuid() NOT NULL,
  created_at           timestamp with time zone DEFAULT now() NOT NULL,
  user_id              uuid                     DEFAULT gen_random_uuid() NOT NULL,
  job_title            text                     NOT NULL,
  company_name         text                     NOT NULL,
  draft_name           text                     NOT NULL,
  session_id           uuid                     NOT NULL,
  education_score      smallint                 NOT NULL,
  skills_score         smallint                 NOT NULL,
  experience_score     smallint                 NOT NULL,
  location_score       smallint                 NOT NULL,
  projects_score       smallint                 NOT NULL,
  overall_score        smallint                 NOT NULL,
  draft                text                     NOT NULL,
  education_score_exp  text                     DEFAULT ''::text NOT NULL,
  experience_score_exp text                     DEFAULT ''::text NOT NULL,
  skills_score_exp     text                     DEFAULT ''::text NOT NULL,
  projects_score_exp   text                     DEFAULT ''::text NOT NULL,
  location_score_exp   text                     DEFAULT ''::text NOT NULL
);

CREATE FUNCTION public.get_cached_cover_letters_by_session (
  p_session_id uuid
)
  RETURNS SETOF public.cached_cover_letters
  LANGUAGE sql
  AS $function$
  select *
  from public.cached_cover_letters
  where user_id = auth.uid()
    and session_id = p_session_id
  order by created_at asc;
$function$;

GRANT ALL ON FUNCTION public.get_cached_cover_letters_by_session(uuid) TO anon;

GRANT ALL ON FUNCTION public.get_cached_cover_letters_by_session(uuid) TO authenticated;

GRANT ALL ON FUNCTION public.get_cached_cover_letters_by_session(uuid) TO service_role;

CREATE FUNCTION public.save_cover_letter_revision (
  p_session_id    uuid,
  p_draft_name    text,
  p_revised_draft text
)
  RETURNS public.cached_cover_letters
  LANGUAGE plpgsql
  AS $function$
declare
  v_existing public.cached_cover_letters%rowtype;
  v_inserted public.cached_cover_letters%rowtype;
begin
  if p_session_id is null then
    raise exception 'Missing session_id';
  end if;

  if p_draft_name is null or btrim(p_draft_name) = '' then
    raise exception 'Missing draft_name';
  end if;

  if p_revised_draft is null or btrim(p_revised_draft) = '' then
    raise exception 'Missing revised_draft';
  end if;

  select *
  into v_existing
  from public.cached_cover_letters
  where user_id = auth.uid()
    and session_id = p_session_id
  order by created_at desc
  limit 1;

  if v_existing.id is null then
    raise exception 'No cached cover letter found for this session';
  end if;

  insert into public.cached_cover_letters (
    user_id,
    job_title,
    company_name,
    draft_name,
    session_id,
    education_score,
    skills_score,
    experience_score,
    projects_score,
    location_score,
    overall_score,
    education_score_exp,
    skills_score_exp,
    experience_score_exp,
    projects_score_exp,
    location_score_exp,
    draft
  )
  values (
    auth.uid(),
    v_existing.job_title,
    v_existing.company_name,
    p_draft_name,
    p_session_id,
    v_existing.education_score,
    v_existing.skills_score,
    v_existing.experience_score,
    v_existing.projects_score,
    v_existing.location_score,
    v_existing.overall_score,
    v_existing.education_score_exp,
    v_existing.skills_score_exp,
    v_existing.experience_score_exp,
    v_existing.projects_score_exp,
    v_existing.location_score_exp,
    p_revised_draft
  )
  returning * into v_inserted;

  update public.cover_letter_sessions
  set current_draft = p_revised_draft
  where id = p_session_id
    and user_id = auth.uid();

  if not found then
    raise exception 'Session not found or not owned by current user';
  end if;

  return v_inserted;
end;
$function$;

GRANT ALL ON FUNCTION public.save_cover_letter_revision(uuid, text, text) TO anon;

GRANT ALL ON FUNCTION public.save_cover_letter_revision(uuid, text, text) TO authenticated;

GRANT ALL ON FUNCTION public.save_cover_letter_revision(uuid, text, text) TO service_role;

ALTER TABLE public.cached_cover_letters
  ENABLE ROW LEVEL SECURITY;

ALTER TABLE public.cached_cover_letters
  ADD CONSTRAINT cached_cover_letters_draft_name_key UNIQUE (draft_name);

ALTER TABLE public.cached_cover_letters
  ADD CONSTRAINT cached_cover_letters_pkey PRIMARY KEY (id);

GRANT ALL ON public.cached_cover_letters TO anon;

GRANT ALL ON public.cached_cover_letters TO authenticated;

GRANT ALL ON public.cached_cover_letters TO service_role;

CREATE POLICY "Enable users to view their own data only" ON public.cached_cover_letters
  TO authenticated
  USING ((( SELECT auth.uid() AS uid) = user_id));

CREATE TABLE public.cached_professional_headshots (
  id                     uuid                     DEFAULT gen_random_uuid() NOT NULL,
  user_id                uuid                     NOT NULL,
  generated_url          text                     NOT NULL,
  created_at             timestamp with time zone DEFAULT now() NOT NULL,
  validation             jsonb                    NOT NULL,
  reference_url          text                     NOT NULL,
  background_url         text,
  background_description text,
  layout                 text                     DEFAULT ''::text NOT NULL,
  attire                 text                     DEFAULT ''::text NOT NULL
);

CREATE FUNCTION public.get_latest_cached_professional_headshots (
  p_user_id uuid
)
  RETURNS SETOF public.cached_professional_headshots
  LANGUAGE plpgsql
  AS $function$
begin
  -- enforce user can only access their own data
  if p_user_id is distinct from auth.uid() then
    raise exception 'Unauthorized';
  end if;

  return query
  select *
  from public.cached_professional_headshots
  where user_id = p_user_id
  order by created_at desc;
end;
$function$;

GRANT ALL ON FUNCTION public.get_latest_cached_professional_headshots(uuid) TO anon;

GRANT ALL ON FUNCTION public.get_latest_cached_professional_headshots(uuid) TO authenticated;

GRANT ALL ON FUNCTION public.get_latest_cached_professional_headshots(uuid) TO service_role;

ALTER TABLE public.cached_professional_headshots
  ENABLE ROW LEVEL SECURITY;

ALTER TABLE public.cached_professional_headshots
  ADD CONSTRAINT cached_professional_headshots_pkey PRIMARY KEY (id);

GRANT ALL ON public.cached_professional_headshots TO anon;

GRANT ALL ON public.cached_professional_headshots TO authenticated;

GRANT ALL ON public.cached_professional_headshots TO service_role;

CREATE POLICY "Enable read access for all users" ON public.cached_professional_headshots
  USING (true);

CREATE TABLE public.cached_resumes (
  id         uuid                     DEFAULT gen_random_uuid() NOT NULL,
  user_id    uuid                     NOT NULL,
  url        text                     NOT NULL,
  created_at timestamp with time zone DEFAULT now() NOT NULL
);

CREATE FUNCTION public.get_latest_cached_resumes (
  p_user_id uuid
)
  RETURNS SETOF public.cached_resumes
  LANGUAGE sql
  AS $function$
  select *
  from public.cached_resumes
  where user_id = p_user_id
    and user_id = auth.uid()
  order by created_at desc;
$function$;

GRANT ALL ON FUNCTION public.get_latest_cached_resumes(uuid) TO anon;

GRANT ALL ON FUNCTION public.get_latest_cached_resumes(uuid) TO authenticated;

GRANT ALL ON FUNCTION public.get_latest_cached_resumes(uuid) TO service_role;

ALTER TABLE public.cached_resumes
  ENABLE ROW LEVEL SECURITY;

ALTER TABLE public.cached_resumes
  ADD CONSTRAINT cached_resumes_pkey PRIMARY KEY (id);

GRANT ALL ON public.cached_resumes TO anon;

GRANT ALL ON public.cached_resumes TO authenticated;

GRANT ALL ON public.cached_resumes TO service_role;

CREATE POLICY "Enable read access for all users" ON public.cached_resumes
  USING (true);

CREATE TABLE public.cached_user_info (
  user_id    uuid                     DEFAULT gen_random_uuid() NOT NULL,
  updated_at timestamp with time zone DEFAULT now() NOT NULL,
  payload    jsonb                    NOT NULL
);

COMMENT ON TABLE public.cached_user_info IS 'Cache storing public JSON user info data';

ALTER TABLE public.cached_user_info
  ENABLE ROW LEVEL SECURITY;

ALTER TABLE public.cached_user_info
  ADD CONSTRAINT cached_user_info_pkey PRIMARY KEY (user_id);

GRANT ALL ON public.cached_user_info TO anon;

GRANT ALL ON public.cached_user_info TO authenticated;

GRANT ALL ON public.cached_user_info TO service_role;

CREATE POLICY "Enable users to view their own data only" ON public.cached_user_info
  TO authenticated
  USING ((( SELECT auth.uid() AS uid) = user_id));

CREATE TABLE public.course (
  id           uuid DEFAULT gen_random_uuid() NOT NULL,
  name         text NOT NULL,
  grade        text,
  user_id      uuid DEFAULT auth.uid() NOT NULL,
  description  text,
  education_id uuid NOT NULL
);

ALTER TABLE public.course
  ENABLE ROW LEVEL SECURITY;

ALTER TABLE public.course
  ADD CONSTRAINT course_unique_user_education_name UNIQUE (user_id, education_id, name);

ALTER TABLE public.course
  ADD CONSTRAINT course_v2_pkey PRIMARY KEY (id);

GRANT ALL ON public.course TO anon;

GRANT ALL ON public.course TO authenticated;

GRANT ALL ON public.course TO service_role;

CREATE POLICY "Enable read access for all users" ON public.course
  USING (true);

CREATE TABLE public.cover_letter_sessions (
  id               uuid                     DEFAULT gen_random_uuid() NOT NULL,
  user_id          uuid                     DEFAULT gen_random_uuid() NOT NULL,
  job_data         jsonb                    NOT NULL,
  current_draft    text                     NOT NULL,
  writing_analysis jsonb,
  writing_sample   text,
  created_at       timestamp with time zone DEFAULT now() NOT NULL
);

COMMENT ON TABLE public.cover_letter_sessions IS 'Table storing recent cover letter generation sessions';

ALTER TABLE public.cover_letter_sessions
  ENABLE ROW LEVEL SECURITY;

ALTER TABLE public.cover_letter_sessions
  ADD CONSTRAINT cover_letter_sessions_pkey PRIMARY KEY (id);

ALTER TABLE public.cached_cover_letters
  ADD CONSTRAINT cached_cover_letters_session_id_fkey FOREIGN KEY (session_id) REFERENCES public.cover_letter_sessions(id) ON UPDATE CASCADE ON DELETE CASCADE;

GRANT ALL ON public.cover_letter_sessions TO anon;

GRANT ALL ON public.cover_letter_sessions TO authenticated;

GRANT ALL ON public.cover_letter_sessions TO service_role;

CREATE POLICY "Enable read access for all users" ON public.cover_letter_sessions
  USING (true);

CREATE TABLE public.education (
  degree      text    NOT NULL,
  majors      text[]  NOT NULL,
  minors      text[]  NOT NULL,
  gpa         text,
  institution text    NOT NULL,
  awards      text[]  NOT NULL,
  year_start  integer,
  year_end    integer,
  user_id     uuid    DEFAULT auth.uid() NOT NULL,
  id          uuid    DEFAULT gen_random_uuid() NOT NULL
);

ALTER TABLE public.education
  ENABLE ROW LEVEL SECURITY;

ALTER TABLE public.education
  ADD CONSTRAINT education_pkey PRIMARY KEY (id);

ALTER TABLE public.course
  ADD CONSTRAINT course_education_id_fkey FOREIGN KEY (education_id) REFERENCES public.education(id) ON DELETE CASCADE;

GRANT ALL ON public.education TO anon;

GRANT ALL ON public.education TO authenticated;

GRANT ALL ON public.education TO service_role;

CREATE POLICY "Enable users to view their own data only" ON public.education
  TO authenticated
  USING ((( SELECT auth.uid() AS uid) = user_id));

CREATE TABLE public.projects (
  name              text   NOT NULL,
  date_start        date   NOT NULL,
  date_end          date   NOT NULL,
  languages_used    text[],
  frameworks_used   text[],
  technologies_used text[],
  description       text   NOT NULL,
  github_url        text,
  demo_url          text,
  thumbnail_url     text,
  user_id           uuid,
  id                uuid   DEFAULT gen_random_uuid() NOT NULL
);

ALTER TABLE public.projects
  ENABLE ROW LEVEL SECURITY;

ALTER TABLE public.projects
  ADD CONSTRAINT projects_pkey PRIMARY KEY (id);

GRANT ALL ON public.projects TO anon;

GRANT ALL ON public.projects TO authenticated;

GRANT ALL ON public.projects TO service_role;

CREATE POLICY "Enable users to view their own data only" ON public.projects
  TO authenticated
  USING ((( SELECT auth.uid() AS uid) = user_id));

CREATE TABLE public.public_api_logs (
  user_id         uuid                        NOT NULL,
  requested_at    timestamp without time zone NOT NULL,
  status_code     smallint                    NOT NULL,
  key_description text                        NOT NULL,
  user_agent      text                        NOT NULL,
  responded_at    timestamp without time zone NOT NULL,
  id              uuid                        DEFAULT gen_random_uuid() NOT NULL
);

ALTER TABLE public.public_api_logs
  ENABLE ROW LEVEL SECURITY;

ALTER TABLE public.public_api_logs
  ADD CONSTRAINT public_api_logs_pkey PRIMARY KEY (id);

GRANT ALL ON public.public_api_logs TO anon;

GRANT ALL ON public.public_api_logs TO authenticated;

GRANT ALL ON public.public_api_logs TO service_role;

CREATE INDEX public_api_logs_requested_at_idx ON public.public_api_logs (requested_at);

CREATE POLICY "Admins can view all logs" ON public.public_api_logs
  FOR SELECT
  TO authenticated
  USING (((auth.jwt() ->> 'user_role'::text) = 'admin'::text));

CREATE POLICY "Enable users to view their own data only" ON public.public_api_logs
  TO authenticated
  USING ((( SELECT auth.uid() AS uid) = user_id));

CREATE TABLE public.skills (
  id                  uuid    DEFAULT gen_random_uuid() NOT NULL,
  name                text    NOT NULL,
  proficiency         integer,
  years_of_experience integer,
  user_id             uuid    NOT NULL
);

ALTER TABLE public.skills
  ENABLE ROW LEVEL SECURITY;

ALTER TABLE public.skills
  ADD CONSTRAINT skills_unique_user_name UNIQUE (name, user_id);

ALTER TABLE public.skills
  ADD CONSTRAINT skills_v2_pkey PRIMARY KEY (id);

GRANT ALL ON public.skills TO anon;

GRANT ALL ON public.skills TO authenticated;

GRANT ALL ON public.skills TO service_role;

CREATE POLICY "Enable read access for all users" ON public.skills
  USING (true);

CREATE TABLE public.subscriptions (
  user_id                uuid                     NOT NULL,
  stripe_customer_id     text,
  stripe_subscription_id text,
  status                 text,
  price_id               text,
  current_period_end     timestamp with time zone,
  cancel_at_period_end   boolean                  DEFAULT false,
  updated_at             timestamp with time zone DEFAULT now() NOT NULL
);

ALTER TABLE public.subscriptions
  ENABLE ROW LEVEL SECURITY;

ALTER TABLE public.subscriptions
  ADD CONSTRAINT subscriptions_pkey PRIMARY KEY (user_id);

ALTER TABLE public.subscriptions
  ADD CONSTRAINT subscriptions_stripe_customer_id_key UNIQUE (stripe_customer_id);

ALTER TABLE public.subscriptions
  ADD CONSTRAINT subscriptions_stripe_subscription_id_key UNIQUE (stripe_subscription_id);

ALTER TABLE public.subscriptions
  ADD CONSTRAINT subscriptions_user_id_fkey FOREIGN KEY (user_id) REFERENCES auth.users(id) ON DELETE CASCADE;

GRANT ALL ON public.subscriptions TO anon;

GRANT ALL ON public.subscriptions TO authenticated;

GRANT ALL ON public.subscriptions TO service_role;

CREATE INDEX subscriptions_customer_idx ON public.subscriptions (stripe_customer_id);

CREATE POLICY "Enable users to view their own data only" ON public.subscriptions
  FOR SELECT
  TO authenticated
  USING ((( SELECT auth.uid() AS uid) = user_id));

CREATE TABLE public.users (
  id                    uuid    NOT NULL,
  name                  text,
  phone_number          text,
  email                 text    NOT NULL,
  current_address       text,
  github_url            text,
  linkedin_url          text,
  portrait_url          text,
  resume_url            text,
  transcript_url        text,
  instagram_url         text,
  facebook_url          text,
  bio                   text,
  current_position      text,
  x_url                 text,
  current_company       text,
  requires_oauth_signup boolean DEFAULT true NOT NULL
);

ALTER TABLE public.users
  ENABLE ROW LEVEL SECURITY;

ALTER TABLE public.users
  ADD CONSTRAINT users_id_fkey FOREIGN KEY (id) REFERENCES auth.users(id) ON DELETE CASCADE;

ALTER TABLE public.users
  ADD CONSTRAINT users_pkey PRIMARY KEY (id);

ALTER TABLE public.api_keys
  ADD CONSTRAINT api_keys_rework_user_id_fkey FOREIGN KEY (user_id) REFERENCES public.users(id) ON UPDATE CASCADE ON DELETE CASCADE;

ALTER TABLE public.cached_cover_letters
  ADD CONSTRAINT cached_cover_letters_user_id_fkey FOREIGN KEY (user_id) REFERENCES public.users(id) ON UPDATE CASCADE ON DELETE CASCADE;

ALTER TABLE public.cached_professional_headshots
  ADD CONSTRAINT cached_professional_headshots_user_id_fkey FOREIGN KEY (user_id) REFERENCES public.users(id) ON UPDATE CASCADE ON DELETE CASCADE;

ALTER TABLE public.cached_resumes
  ADD CONSTRAINT cached_resumes_user_id_fkey FOREIGN KEY (user_id) REFERENCES public.users(id) ON UPDATE CASCADE ON DELETE CASCADE;

ALTER TABLE public.cached_user_info
  ADD CONSTRAINT cached_user_info_user_id_fkey FOREIGN KEY (user_id) REFERENCES public.users(id) ON UPDATE CASCADE ON DELETE CASCADE;

ALTER TABLE public.course
  ADD CONSTRAINT course_user_id_fkey FOREIGN KEY (user_id) REFERENCES public.users(id) ON UPDATE CASCADE ON DELETE CASCADE;

ALTER TABLE public.cover_letter_sessions
  ADD CONSTRAINT cover_letter_sessions_user_id_fkey FOREIGN KEY (user_id) REFERENCES public.users(id) ON UPDATE CASCADE ON DELETE CASCADE;

ALTER TABLE public.education
  ADD CONSTRAINT "Education_user_id_fkey" FOREIGN KEY (user_id) REFERENCES public.users(id) ON DELETE CASCADE;

ALTER TABLE public.projects
  ADD CONSTRAINT projects_user_id_fkey FOREIGN KEY (user_id) REFERENCES public.users(id) ON UPDATE CASCADE ON DELETE CASCADE;

ALTER TABLE public.public_api_logs
  ADD CONSTRAINT public_api_logs_user_id_fkey FOREIGN KEY (user_id) REFERENCES public.users(id) ON UPDATE CASCADE ON DELETE CASCADE;

ALTER TABLE public.skills
  ADD CONSTRAINT skills_user_id_fkey FOREIGN KEY (user_id) REFERENCES public.users(id) ON UPDATE CASCADE ON DELETE CASCADE;

GRANT ALL ON public.users TO anon;

GRANT ALL ON public.users TO authenticated;

GRANT ALL ON public.users TO service_role;

CREATE POLICY "Enable users to view their own data only" ON public.users
  TO authenticated
  USING ((( SELECT auth.uid() AS uid) = id));

CREATE TABLE public.work_experiences (
  id              uuid DEFAULT gen_random_uuid() NOT NULL,
  company         text NOT NULL,
  job_title       text NOT NULL,
  date_start      text,
  date_end        text,
  job_description text,
  user_id         uuid NOT NULL
);

ALTER TABLE public.work_experiences
  ENABLE ROW LEVEL SECURITY;

ALTER TABLE public.work_experiences
  ADD CONSTRAINT work_experiences_unique_user_job UNIQUE (company, job_title, user_id);

ALTER TABLE public.work_experiences
  ADD CONSTRAINT work_experiences_user_id_fkey FOREIGN KEY (user_id) REFERENCES public.users(id) ON DELETE CASCADE;

ALTER TABLE public.work_experiences
  ADD CONSTRAINT work_experiences_v2_pkey PRIMARY KEY (id);

GRANT ALL ON public.work_experiences TO anon;

GRANT ALL ON public.work_experiences TO authenticated;

GRANT ALL ON public.work_experiences TO service_role;

CREATE POLICY "Enable read access for all users" ON public.work_experiences
  USING (true);
