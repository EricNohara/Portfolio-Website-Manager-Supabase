-- AI credits use a fast balance row plus an immutable mutation ledger.
-- Subscription billing details remain in public.subscriptions.

CREATE TABLE public.ai_credit_balances (
  user_id uuid PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  subscription_credits integer NOT NULL DEFAULT 0
    CHECK (subscription_credits >= 0),
  lifetime_credits integer NOT NULL DEFAULT 0
    CHECK (lifetime_credits >= 0),
  updated_at timestamptz NOT NULL DEFAULT now()
);

CREATE TABLE public.ai_credit_ledger (
  id bigint GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
  user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  subscription_delta integer NOT NULL DEFAULT 0,
  lifetime_delta integer NOT NULL DEFAULT 0,
  reason text NOT NULL CHECK (
    reason IN (
      'signup_grant',
      'subscription_grant',
      'subscription_expiration',
      'credit_purchase',
      'ad_reward',
      'agent_usage',
      'refund',
      'admin_adjustment'
    )
  ),
  idempotency_key text UNIQUE,
  created_at timestamptz NOT NULL DEFAULT now(),
  CHECK (subscription_delta <> 0 OR lifetime_delta <> 0)
);

CREATE INDEX ai_credit_ledger_user_created_idx
  ON public.ai_credit_ledger (user_id, created_at DESC);

ALTER TABLE public.ai_credit_balances ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.ai_credit_ledger ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view their own AI credit balance"
  ON public.ai_credit_balances
  FOR SELECT
  TO authenticated
  USING ((SELECT auth.uid()) = user_id);

CREATE POLICY "Users can view their own AI credit ledger"
  ON public.ai_credit_ledger
  FOR SELECT
  TO authenticated
  USING ((SELECT auth.uid()) = user_id);

REVOKE ALL PRIVILEGES ON public.ai_credit_balances FROM PUBLIC, anon, authenticated;
REVOKE ALL PRIVILEGES ON public.ai_credit_ledger FROM PUBLIC, anon, authenticated;
REVOKE ALL PRIVILEGES ON SEQUENCE public.ai_credit_ledger_id_seq FROM PUBLIC, anon, authenticated;

GRANT SELECT ON public.ai_credit_balances TO authenticated;
GRANT SELECT ON public.ai_credit_ledger TO authenticated;
GRANT ALL PRIVILEGES ON public.ai_credit_balances TO service_role;
GRANT ALL PRIVILEGES ON public.ai_credit_ledger TO service_role;
GRANT ALL PRIVILEGES ON SEQUENCE public.ai_credit_ledger_id_seq TO service_role;

-- Every user that exists when the migration is applied receives the same
-- lifetime signup grant as a newly-created user.
INSERT INTO public.ai_credit_balances (user_id, subscription_credits, lifetime_credits)
SELECT id, 0, 3
FROM auth.users
ON CONFLICT (user_id) DO NOTHING;

INSERT INTO public.ai_credit_ledger (
  user_id,
  subscription_delta,
  lifetime_delta,
  reason,
  idempotency_key
)
SELECT
  id,
  0,
  3,
  'signup_grant',
  'signup_grant_' || id::text
FROM auth.users
ON CONFLICT (idempotency_key) DO NOTHING;

-- Extend the existing auth trigger so all signup mechanisms initialize
-- profile and credit state in the same transaction as auth.users.
CREATE OR REPLACE FUNCTION public.handle_new_user()
  RETURNS trigger
  LANGUAGE plpgsql
  SECURITY DEFINER
  SET search_path TO ''
AS $function$
BEGIN
  INSERT INTO public.users (id, email)
  VALUES (NEW.id, NEW.email);

  INSERT INTO public.ai_credit_balances (
    user_id,
    subscription_credits,
    lifetime_credits
  )
  VALUES (NEW.id, 0, 3);

  INSERT INTO public.ai_credit_ledger (
    user_id,
    subscription_delta,
    lifetime_delta,
    reason,
    idempotency_key
  )
  VALUES (
    NEW.id,
    0,
    3,
    'signup_grant',
    'signup_grant_' || NEW.id::text
  );

  RETURN NEW;
END;
$function$;

-- Spend subscription credits first while holding the user's balance row lock.
CREATE OR REPLACE FUNCTION public.consume_ai_credits(
  p_user_id uuid,
  p_amount integer,
  p_reason text,
  p_idempotency_key text DEFAULT NULL
)
RETURNS jsonb
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO ''
AS $function$
DECLARE
  v_balance public.ai_credit_balances%ROWTYPE;
  v_existing public.ai_credit_ledger%ROWTYPE;
  v_subscription_spent integer;
  v_lifetime_spent integer;
BEGIN
  IF p_user_id IS NULL THEN
    RAISE EXCEPTION USING ERRCODE = '22004', MESSAGE = 'user_id_required';
  END IF;

  IF p_amount IS NULL OR p_amount <= 0 THEN
    RAISE EXCEPTION USING ERRCODE = '22023', MESSAGE = 'credit_amount_must_be_positive';
  END IF;

  IF p_reason NOT IN ('agent_usage', 'admin_adjustment') THEN
    RAISE EXCEPTION USING ERRCODE = '22023', MESSAGE = 'invalid_credit_consumption_reason';
  END IF;

  IF p_idempotency_key IS NOT NULL AND btrim(p_idempotency_key) = '' THEN
    RAISE EXCEPTION USING ERRCODE = '22023', MESSAGE = 'idempotency_key_cannot_be_empty';
  END IF;

  IF p_idempotency_key IS NOT NULL THEN
    PERFORM pg_catalog.pg_advisory_xact_lock(
      pg_catalog.hashtextextended(p_idempotency_key, 0)
    );

    SELECT ledger.*
    INTO v_existing
    FROM public.ai_credit_ledger AS ledger
    WHERE ledger.idempotency_key = p_idempotency_key;

    IF FOUND THEN
      IF v_existing.user_id <> p_user_id
        OR v_existing.reason <> p_reason
        OR v_existing.subscription_delta > 0
        OR v_existing.lifetime_delta > 0
        OR (-v_existing.subscription_delta - v_existing.lifetime_delta) <> p_amount
      THEN
        RAISE EXCEPTION USING ERRCODE = '23505', MESSAGE = 'idempotency_key_conflict';
      END IF;

      SELECT balance.*
      INTO v_balance
      FROM public.ai_credit_balances AS balance
      WHERE balance.user_id = p_user_id;

      RETURN jsonb_build_object(
        'subscriptionCredits', v_balance.subscription_credits,
        'lifetimeCredits', v_balance.lifetime_credits,
        'subscriptionSpent', -v_existing.subscription_delta,
        'lifetimeSpent', -v_existing.lifetime_delta,
        'wasDuplicate', true
      );
    END IF;
  END IF;

  INSERT INTO public.ai_credit_balances (user_id)
  VALUES (p_user_id)
  ON CONFLICT (user_id) DO NOTHING;

  SELECT balance.*
  INTO v_balance
  FROM public.ai_credit_balances AS balance
  WHERE balance.user_id = p_user_id
  FOR UPDATE;

  IF v_balance.subscription_credits + v_balance.lifetime_credits < p_amount THEN
    RAISE EXCEPTION USING ERRCODE = 'P0001', MESSAGE = 'insufficient_ai_credits';
  END IF;

  v_subscription_spent := LEAST(v_balance.subscription_credits, p_amount);
  v_lifetime_spent := p_amount - v_subscription_spent;

  UPDATE public.ai_credit_balances
  SET
    subscription_credits = subscription_credits - v_subscription_spent,
    lifetime_credits = lifetime_credits - v_lifetime_spent,
    updated_at = now()
  WHERE user_id = p_user_id
  RETURNING * INTO v_balance;

  INSERT INTO public.ai_credit_ledger (
    user_id,
    subscription_delta,
    lifetime_delta,
    reason,
    idempotency_key
  )
  VALUES (
    p_user_id,
    -v_subscription_spent,
    -v_lifetime_spent,
    p_reason,
    p_idempotency_key
  );

  RETURN jsonb_build_object(
    'subscriptionCredits', v_balance.subscription_credits,
    'lifetimeCredits', v_balance.lifetime_credits,
    'subscriptionSpent', v_subscription_spent,
    'lifetimeSpent', v_lifetime_spent,
    'wasDuplicate', false
  );
END;
$function$;

-- Positive grants include purchases, rewards, refunds, and controlled support
-- adjustments. Negative mutations must use a purpose-built RPC.
CREATE OR REPLACE FUNCTION public.grant_ai_credits(
  p_user_id uuid,
  p_subscription_amount integer,
  p_lifetime_amount integer,
  p_reason text,
  p_idempotency_key text DEFAULT NULL
)
RETURNS jsonb
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO ''
AS $function$
DECLARE
  v_balance public.ai_credit_balances%ROWTYPE;
  v_existing public.ai_credit_ledger%ROWTYPE;
BEGIN
  IF p_user_id IS NULL THEN
    RAISE EXCEPTION USING ERRCODE = '22004', MESSAGE = 'user_id_required';
  END IF;

  IF p_subscription_amount IS NULL
    OR p_lifetime_amount IS NULL
    OR p_subscription_amount < 0
    OR p_lifetime_amount < 0
    OR (p_subscription_amount = 0 AND p_lifetime_amount = 0)
  THEN
    RAISE EXCEPTION USING ERRCODE = '22023', MESSAGE = 'invalid_credit_grant_amount';
  END IF;

  IF p_reason NOT IN (
    'signup_grant',
    'subscription_grant',
    'credit_purchase',
    'ad_reward',
    'refund',
    'admin_adjustment'
  ) THEN
    RAISE EXCEPTION USING ERRCODE = '22023', MESSAGE = 'invalid_credit_grant_reason';
  END IF;

  IF p_idempotency_key IS NOT NULL AND btrim(p_idempotency_key) = '' THEN
    RAISE EXCEPTION USING ERRCODE = '22023', MESSAGE = 'idempotency_key_cannot_be_empty';
  END IF;

  IF p_idempotency_key IS NOT NULL THEN
    PERFORM pg_catalog.pg_advisory_xact_lock(
      pg_catalog.hashtextextended(p_idempotency_key, 0)
    );

    SELECT ledger.*
    INTO v_existing
    FROM public.ai_credit_ledger AS ledger
    WHERE ledger.idempotency_key = p_idempotency_key;

    IF FOUND THEN
      IF v_existing.user_id <> p_user_id
        OR v_existing.reason <> p_reason
        OR v_existing.subscription_delta <> p_subscription_amount
        OR v_existing.lifetime_delta <> p_lifetime_amount
      THEN
        RAISE EXCEPTION USING ERRCODE = '23505', MESSAGE = 'idempotency_key_conflict';
      END IF;

      SELECT balance.*
      INTO v_balance
      FROM public.ai_credit_balances AS balance
      WHERE balance.user_id = p_user_id;

      RETURN jsonb_build_object(
        'subscriptionCredits', v_balance.subscription_credits,
        'lifetimeCredits', v_balance.lifetime_credits,
        'wasDuplicate', true
      );
    END IF;
  END IF;

  INSERT INTO public.ai_credit_balances (user_id)
  VALUES (p_user_id)
  ON CONFLICT (user_id) DO NOTHING;

  UPDATE public.ai_credit_balances
  SET
    subscription_credits = subscription_credits + p_subscription_amount,
    lifetime_credits = lifetime_credits + p_lifetime_amount,
    updated_at = now()
  WHERE user_id = p_user_id
  RETURNING * INTO v_balance;

  INSERT INTO public.ai_credit_ledger (
    user_id,
    subscription_delta,
    lifetime_delta,
    reason,
    idempotency_key
  )
  VALUES (
    p_user_id,
    p_subscription_amount,
    p_lifetime_amount,
    p_reason,
    p_idempotency_key
  );

  RETURN jsonb_build_object(
    'subscriptionCredits', v_balance.subscription_credits,
    'lifetimeCredits', v_balance.lifetime_credits,
    'wasDuplicate', false
  );
END;
$function$;

-- Replace, rather than add to, subscription credits at a paid billing event.
-- The caller resolves tier/cadence and supplies the complete new allocation.
CREATE OR REPLACE FUNCTION public.replace_subscription_credits(
  p_user_id uuid,
  p_new_amount integer,
  p_idempotency_key text
)
RETURNS jsonb
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO ''
AS $function$
DECLARE
  v_balance public.ai_credit_balances%ROWTYPE;
  v_existing public.ai_credit_ledger%ROWTYPE;
  v_expired integer;
  v_expiration_key text;
  v_grant_key text;
BEGIN
  IF p_user_id IS NULL THEN
    RAISE EXCEPTION USING ERRCODE = '22004', MESSAGE = 'user_id_required';
  END IF;

  IF p_new_amount IS NULL OR p_new_amount <= 0 THEN
    RAISE EXCEPTION USING ERRCODE = '22023', MESSAGE = 'subscription_credit_amount_must_be_positive';
  END IF;

  IF p_idempotency_key IS NULL OR btrim(p_idempotency_key) = '' THEN
    RAISE EXCEPTION USING ERRCODE = '22023', MESSAGE = 'idempotency_key_required';
  END IF;

  v_expiration_key := p_idempotency_key || ':expiration';
  v_grant_key := p_idempotency_key || ':grant';

  PERFORM pg_catalog.pg_advisory_xact_lock(
    pg_catalog.hashtextextended(p_idempotency_key, 0)
  );

  SELECT ledger.*
  INTO v_existing
  FROM public.ai_credit_ledger AS ledger
  WHERE ledger.idempotency_key = v_grant_key;

  IF FOUND THEN
    IF v_existing.user_id <> p_user_id
      OR v_existing.reason <> 'subscription_grant'
      OR v_existing.subscription_delta <> p_new_amount
      OR v_existing.lifetime_delta <> 0
    THEN
      RAISE EXCEPTION USING ERRCODE = '23505', MESSAGE = 'idempotency_key_conflict';
    END IF;

    SELECT balance.*
    INTO v_balance
    FROM public.ai_credit_balances AS balance
    WHERE balance.user_id = p_user_id;

    RETURN jsonb_build_object(
      'subscriptionCredits', v_balance.subscription_credits,
      'lifetimeCredits', v_balance.lifetime_credits,
      'expiredSubscriptionCredits', 0,
      'wasDuplicate', true
    );
  END IF;

  INSERT INTO public.ai_credit_balances (user_id)
  VALUES (p_user_id)
  ON CONFLICT (user_id) DO NOTHING;

  SELECT balance.*
  INTO v_balance
  FROM public.ai_credit_balances AS balance
  WHERE balance.user_id = p_user_id
  FOR UPDATE;

  v_expired := v_balance.subscription_credits;

  IF v_expired > 0 THEN
    INSERT INTO public.ai_credit_ledger (
      user_id,
      subscription_delta,
      lifetime_delta,
      reason,
      idempotency_key
    )
    VALUES (
      p_user_id,
      -v_expired,
      0,
      'subscription_expiration',
      v_expiration_key
    )
    ON CONFLICT (idempotency_key) DO NOTHING;
  END IF;

  UPDATE public.ai_credit_balances
  SET
    subscription_credits = p_new_amount,
    updated_at = now()
  WHERE user_id = p_user_id
  RETURNING * INTO v_balance;

  INSERT INTO public.ai_credit_ledger (
    user_id,
    subscription_delta,
    lifetime_delta,
    reason,
    idempotency_key
  )
  VALUES (
    p_user_id,
    p_new_amount,
    0,
    'subscription_grant',
    v_grant_key
  );

  RETURN jsonb_build_object(
    'subscriptionCredits', v_balance.subscription_credits,
    'lifetimeCredits', v_balance.lifetime_credits,
    'expiredSubscriptionCredits', v_expired,
    'wasDuplicate', false
  );
END;
$function$;

-- Expire the old period without granting a replacement when renewal payment
-- fails or when a paid subscription reaches its terminal end.
CREATE OR REPLACE FUNCTION public.expire_subscription_credits(
  p_user_id uuid,
  p_idempotency_key text
)
RETURNS jsonb
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO ''
AS $function$
DECLARE
  v_balance public.ai_credit_balances%ROWTYPE;
  v_existing public.ai_credit_ledger%ROWTYPE;
  v_expired integer;
  v_expiration_key text;
  v_grant_key text;
BEGIN
  IF p_user_id IS NULL THEN
    RAISE EXCEPTION USING ERRCODE = '22004', MESSAGE = 'user_id_required';
  END IF;

  IF p_idempotency_key IS NULL OR btrim(p_idempotency_key) = '' THEN
    RAISE EXCEPTION USING ERRCODE = '22023', MESSAGE = 'idempotency_key_required';
  END IF;

  v_expiration_key := p_idempotency_key || ':expiration';
  v_grant_key := p_idempotency_key || ':grant';

  PERFORM pg_catalog.pg_advisory_xact_lock(
    pg_catalog.hashtextextended(p_idempotency_key, 0)
  );

  -- Stripe can deliver a stale payment_failed event after invoice.paid. A
  -- successful grant for the same invoice always wins regardless of delivery
  -- order, including when there were zero old credits to expire/record.
  SELECT ledger.*
  INTO v_existing
  FROM public.ai_credit_ledger AS ledger
  WHERE ledger.idempotency_key = v_grant_key;

  IF FOUND THEN
    IF v_existing.user_id <> p_user_id
      OR v_existing.reason <> 'subscription_grant'
      OR v_existing.subscription_delta <= 0
      OR v_existing.lifetime_delta <> 0
    THEN
      RAISE EXCEPTION USING ERRCODE = '23505', MESSAGE = 'idempotency_key_conflict';
    END IF;

    SELECT balance.*
    INTO v_balance
    FROM public.ai_credit_balances AS balance
    WHERE balance.user_id = p_user_id;

    RETURN jsonb_build_object(
      'subscriptionCredits', v_balance.subscription_credits,
      'lifetimeCredits', v_balance.lifetime_credits,
      'expiredSubscriptionCredits', 0,
      'wasDuplicate', true
    );
  END IF;

  SELECT ledger.*
  INTO v_existing
  FROM public.ai_credit_ledger AS ledger
  WHERE ledger.idempotency_key = v_expiration_key;

  IF FOUND THEN
    IF v_existing.user_id <> p_user_id
      OR v_existing.reason <> 'subscription_expiration'
      OR v_existing.subscription_delta >= 0
      OR v_existing.lifetime_delta <> 0
    THEN
      RAISE EXCEPTION USING ERRCODE = '23505', MESSAGE = 'idempotency_key_conflict';
    END IF;

    SELECT balance.*
    INTO v_balance
    FROM public.ai_credit_balances AS balance
    WHERE balance.user_id = p_user_id;

    RETURN jsonb_build_object(
      'subscriptionCredits', v_balance.subscription_credits,
      'lifetimeCredits', v_balance.lifetime_credits,
      'expiredSubscriptionCredits', -v_existing.subscription_delta,
      'wasDuplicate', true
    );
  END IF;

  INSERT INTO public.ai_credit_balances (user_id)
  VALUES (p_user_id)
  ON CONFLICT (user_id) DO NOTHING;

  SELECT balance.*
  INTO v_balance
  FROM public.ai_credit_balances AS balance
  WHERE balance.user_id = p_user_id
  FOR UPDATE;

  v_expired := v_balance.subscription_credits;

  IF v_expired > 0 THEN
    UPDATE public.ai_credit_balances
    SET subscription_credits = 0, updated_at = now()
    WHERE user_id = p_user_id
    RETURNING * INTO v_balance;

    INSERT INTO public.ai_credit_ledger (
      user_id,
      subscription_delta,
      lifetime_delta,
      reason,
      idempotency_key
    )
    VALUES (
      p_user_id,
      -v_expired,
      0,
      'subscription_expiration',
      v_expiration_key
    );
  END IF;

  RETURN jsonb_build_object(
    'subscriptionCredits', v_balance.subscription_credits,
    'lifetimeCredits', v_balance.lifetime_credits,
    'expiredSubscriptionCredits', v_expired,
    'wasDuplicate', false
  );
END;
$function$;

REVOKE ALL ON FUNCTION public.consume_ai_credits(uuid, integer, text, text)
  FROM PUBLIC, anon, authenticated;
REVOKE ALL ON FUNCTION public.grant_ai_credits(uuid, integer, integer, text, text)
  FROM PUBLIC, anon, authenticated;
REVOKE ALL ON FUNCTION public.replace_subscription_credits(uuid, integer, text)
  FROM PUBLIC, anon, authenticated;
REVOKE ALL ON FUNCTION public.expire_subscription_credits(uuid, text)
  FROM PUBLIC, anon, authenticated;

GRANT EXECUTE ON FUNCTION public.consume_ai_credits(uuid, integer, text, text)
  TO service_role;
GRANT EXECUTE ON FUNCTION public.grant_ai_credits(uuid, integer, integer, text, text)
  TO service_role;
GRANT EXECUTE ON FUNCTION public.replace_subscription_credits(uuid, integer, text)
  TO service_role;
GRANT EXECUTE ON FUNCTION public.expire_subscription_credits(uuid, text)
  TO service_role;

-- Cached AI output remains a Premium-only application feature. Remove direct
-- authenticated access so a downgraded or free user cannot bypass the tier
-- checks by calling the Data API or legacy cache RPCs directly.
REVOKE ALL PRIVILEGES ON public.cached_resumes FROM authenticated;
REVOKE ALL PRIVILEGES ON public.cached_cover_letters FROM authenticated;
REVOKE ALL PRIVILEGES ON public.cover_letter_sessions FROM authenticated;
REVOKE ALL PRIVILEGES ON public.cached_professional_headshots FROM authenticated;

REVOKE ALL ON FUNCTION public.get_latest_cached_cover_letters() FROM authenticated;
REVOKE ALL ON FUNCTION public.get_cached_cover_letters_by_session(uuid) FROM authenticated;
REVOKE ALL ON FUNCTION public.save_cover_letter_revision(uuid, text, text) FROM authenticated;
REVOKE ALL ON FUNCTION public.get_latest_cached_professional_headshots(uuid) FROM authenticated;
REVOKE ALL ON FUNCTION public.get_latest_cached_resumes(uuid) FROM authenticated;

CREATE OR REPLACE FUNCTION public.get_latest_cached_cover_letters_for_user(
  p_user_id uuid
)
RETURNS TABLE (
  job_title text,
  company_name text,
  session_id uuid,
  created_at timestamptz
)
LANGUAGE sql
STABLE
SET search_path TO ''
AS $function$
  SELECT DISTINCT ON (letter.session_id)
    letter.job_title,
    letter.company_name,
    letter.session_id,
    letter.created_at
  FROM public.cached_cover_letters AS letter
  WHERE letter.user_id = p_user_id
  ORDER BY letter.session_id, letter.created_at DESC;
$function$;

CREATE OR REPLACE FUNCTION public.get_cached_cover_letters_by_session_for_user(
  p_user_id uuid,
  p_session_id uuid
)
RETURNS SETOF public.cached_cover_letters
LANGUAGE sql
STABLE
SET search_path TO ''
AS $function$
  SELECT letter.*
  FROM public.cached_cover_letters AS letter
  WHERE letter.user_id = p_user_id
    AND letter.session_id = p_session_id
  ORDER BY letter.created_at ASC;
$function$;

CREATE OR REPLACE FUNCTION public.save_cover_letter_revision_for_user(
  p_user_id uuid,
  p_session_id uuid,
  p_draft_name text,
  p_revised_draft text
)
RETURNS public.cached_cover_letters
LANGUAGE plpgsql
SET search_path TO ''
AS $function$
DECLARE
  v_existing public.cached_cover_letters%ROWTYPE;
  v_inserted public.cached_cover_letters%ROWTYPE;
BEGIN
  IF p_user_id IS NULL OR p_session_id IS NULL THEN
    RAISE EXCEPTION USING ERRCODE = '22004', MESSAGE = 'user_and_session_required';
  END IF;

  IF p_draft_name IS NULL OR btrim(p_draft_name) = '' THEN
    RAISE EXCEPTION USING ERRCODE = '22023', MESSAGE = 'draft_name_required';
  END IF;

  IF p_revised_draft IS NULL OR btrim(p_revised_draft) = '' THEN
    RAISE EXCEPTION USING ERRCODE = '22023', MESSAGE = 'revised_draft_required';
  END IF;

  SELECT letter.*
  INTO v_existing
  FROM public.cached_cover_letters AS letter
  WHERE letter.user_id = p_user_id
    AND letter.session_id = p_session_id
  ORDER BY letter.created_at DESC
  LIMIT 1
  FOR UPDATE;

  IF v_existing.id IS NULL THEN
    RAISE EXCEPTION USING ERRCODE = 'P0002', MESSAGE = 'cached_cover_letter_not_found';
  END IF;

  UPDATE public.cover_letter_sessions
  SET current_draft = p_revised_draft
  WHERE id = p_session_id
    AND user_id = p_user_id;

  IF NOT FOUND THEN
    RAISE EXCEPTION USING ERRCODE = 'P0002', MESSAGE = 'cover_letter_session_not_found';
  END IF;

  INSERT INTO public.cached_cover_letters (
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
  VALUES (
    p_user_id,
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
  RETURNING * INTO v_inserted;

  RETURN v_inserted;
END;
$function$;

REVOKE ALL ON FUNCTION public.get_latest_cached_cover_letters_for_user(uuid)
  FROM PUBLIC, anon, authenticated;
REVOKE ALL ON FUNCTION public.get_cached_cover_letters_by_session_for_user(uuid, uuid)
  FROM PUBLIC, anon, authenticated;
REVOKE ALL ON FUNCTION public.save_cover_letter_revision_for_user(uuid, uuid, text, text)
  FROM PUBLIC, anon, authenticated;

GRANT EXECUTE ON FUNCTION public.get_latest_cached_cover_letters_for_user(uuid)
  TO service_role;
GRANT EXECUTE ON FUNCTION public.get_cached_cover_letters_by_session_for_user(uuid, uuid)
  TO service_role;
GRANT EXECUTE ON FUNCTION public.save_cover_letter_revision_for_user(uuid, uuid, text, text)
  TO service_role;
