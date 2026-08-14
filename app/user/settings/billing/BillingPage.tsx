"use client";

import { Braces, CirclePoundSterling, Crown, Landmark } from "lucide-react";
import React, { useEffect, useState } from "react";

import { ButtonOne } from "@/app/components/Buttons/Buttons";
import SelectDropdown from "@/app/components/SelectDropdown/SelectDropdown";
import SubscriptionCard from "@/app/components/SubscriptionCard/SubscriptionCard";
import { useTier } from "@/app/context/TierProvider";
import { useToast } from "@/app/context/ToastProvider";
import { headerFont } from "@/app/localFonts";
import {
  FREE_SIGNUP_LIFETIME_CREDITS,
  SUBSCRIPTION_CREDIT_ALLOCATIONS,
} from "@/utils/aiCredits/config";

import styles from "./BillingPage.module.css";

type Tier = "free" | "developer" | "premium";
type Interval = "monthly" | "yearly";

type SubscriptionStatus = {
  tier: Tier; // from your subscription route
  status: string | null;
  priceId: string | null;
  currentPeriodEnd: string | null;
  cancelAtPeriodEnd: boolean | null;
  updatedAt: string | null;
};

const PRICE_IDS = {
  premium: {
    monthly: process.env.NEXT_PUBLIC_PREMIUM_MONTHLY_PRICE_ID!,
    yearly: process.env.NEXT_PUBLIC_PREMIUM_YEARLY_PRICE_ID!,
  },
  developer: {
    monthly: process.env.NEXT_PUBLIC_DEVELOPER_MONTHLY_PRICE_ID!,
    yearly: process.env.NEXT_PUBLIC_DEVELOPER_YEARLY_PRICE_ID!,
  },
} as const;

function assertPriceEnvs(): boolean {
  return Boolean(
    PRICE_IDS.premium.monthly &&
    PRICE_IDS.premium.yearly &&
    PRICE_IDS.developer.monthly &&
    PRICE_IDS.developer.yearly,
  );
}

function deriveIntervalFromPriceId(priceId: string | null): Interval | null {
  if (!priceId) return null;
  if (priceId === PRICE_IDS.developer.monthly) return "monthly";
  if (priceId === PRICE_IDS.developer.yearly) return "yearly";
  if (priceId === PRICE_IDS.premium.monthly) return "monthly";
  if (priceId === PRICE_IDS.premium.yearly) return "yearly";
  return null;
}

// eslint-disable-next-line
async function postJson<T>(url: string, body?: any): Promise<T> {
  const res = await fetch(url, {
    method: "POST",
    headers: body ? { "Content-Type": "application/json" } : undefined,
    body: body ? JSON.stringify(body) : undefined,
  });

  const data = await res.json().catch(() => ({}));
  if (!res.ok) {
    // eslint-disable-next-line
    const msg =
      (data as any)?.error ||
      (data as any)?.message ||
      `Request failed: ${res.status}`;
    throw new Error(msg);
  }
  return data as T;
}

export default function BillingPage() {
  const toast = useToast();

  const { refresh } = useTier();

  const [sub, setSub] = useState<SubscriptionStatus | null>(null);
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState<
    null | "checkout" | "portal"
  >(null);
  const [selectedInterval, setSelectedInterval] = useState<Interval>("monthly");

  useEffect(() => {
    const loadSubscription = async () => {
      setLoading(true);
      try {
        if (!assertPriceEnvs()) {
          throw new Error(
            "Missing NEXT_PUBLIC_* price IDs in .env.local (restart dev server after editing).",
          );
        }

        const params = new URLSearchParams(window.location.search);
        const sessionId = params.get("session_id");

        if (params.get("checkout") === "success" && sessionId) {
          await postJson<{ ok: true }>(
            "/api/internal/stripe/checkout/confirm",
            {
              sessionId,
            },
          );
          await refresh();

          const url = new URL(window.location.href);
          url.searchParams.delete("checkout");
          url.searchParams.delete("session_id");
          window.history.replaceState({}, "", url);
        }

        const subscriptionRes = await fetch("/api/internal/user/subscription", {
          method: "GET",
          cache: "no-store",
        });
        const data = (await subscriptionRes.json()) as SubscriptionStatus & {
          error?: string;
          message?: string;
        };

        if (!subscriptionRes.ok) {
          throw new Error(
            data.error || data.message || "Failed to load subscription.",
          );
        }

        setSub(data ?? null);

        const inferred = deriveIntervalFromPriceId(data?.priceId ?? null);
        if (inferred) setSelectedInterval(inferred);
      } catch (e) {
        const err = e as Error;
        toast.error("Error", err.message ?? "Failed to load subscription.");
      } finally {
        setLoading(false);
      }
    };

    loadSubscription();
  }, [refresh, toast]);

  const startCheckout = async (
    tier: Exclude<Tier, "free">,
    interval: Interval,
  ) => {
    setActionLoading("checkout");
    try {
      const priceId = PRICE_IDS[tier][interval];

      const { url } = await postJson<{ url: string }>(
        "/api/internal/stripe/checkout",
        {
          priceId,
        },
      );

      window.location.assign(url);
    } catch (e) {
      const err = e as Error;
      toast.error("Error", err.message ?? "Failed to start checkout.");
      setActionLoading(null);
    }
  };

  const openPortal = async () => {
    setActionLoading("portal");
    try {
      const { url } = await postJson<{ url: string }>(
        "/api/internal/stripe/portal",
      );
      window.location.assign(url);
    } catch (e) {
      const err = e as Error;
      toast.error("Error", err.message ?? "Failed to open billing portal.");
      setActionLoading(null);
    }
  };

  const selectedDeveloperCredits =
    SUBSCRIPTION_CREDIT_ALLOCATIONS.developer[selectedInterval];
  const selectedPremiumCredits =
    SUBSCRIPTION_CREDIT_ALLOCATIONS.premium[selectedInterval];

  return (
    <div className={styles.container}>
      <div className={styles.formHeader}>
        <div className={styles.headerText}>
          <h1 className={`${headerFont.className} ${styles.formTitle}`}>
            Billing
          </h1>
        </div>

        <div className={styles.buttons}>
          <ButtonOne onClick={openPortal} disabled={actionLoading !== null}>
            Manage billing
          </ButtonOne>

          <SelectDropdown
            value={selectedInterval}
            options={[
              { value: "monthly", label: "Monthly Rates" },
              { value: "yearly", label: "Yearly Rates" },
            ]}
            onChange={(value) => setSelectedInterval(value as Interval)}
            disabled={actionLoading !== null}
            ariaLabel="Billing interval"
            className={styles.intervalDropdown}
          />
        </div>
      </div>

      {/* Plans */}
      <div className={styles.plans}>
        <SubscriptionCard
          tier="free"
          title="Free"
          titleIcon={Landmark}
          subtitle="Default plan for small portfolios"
          price="0"
          billingInterval={selectedInterval}
          benefits={[
            "1 free API key",
            "Weekly performance stats",
            `${FREE_SIGNUP_LIFETIME_CREDITS} lifetime AI credits at signup`,
          ]}
          onCheckout={startCheckout}
          isLoading={loading}
          disabled={loading}
          active={sub?.tier === "free"}
          onPortal={openPortal}
          currentTier={sub?.tier ?? "free"}
        />

        <SubscriptionCard
          tier="developer"
          title="Developer"
          titleIcon={Braces}
          subtitle="Best for software developers"
          price={selectedInterval === "monthly" ? "0.99" : "10.99"}
          billingInterval={selectedInterval}
          benefits={[
            "5 API keys",
            "Weekly performance emails",
            `${selectedDeveloperCredits} AI credits per billing period`,
          ]}
          onCheckout={startCheckout}
          isLoading={loading}
          disabled={loading}
          active={sub?.tier === "developer"}
          onPortal={openPortal}
          currentTier={sub?.tier ?? "developer"}
        />

        <SubscriptionCard
          tier="premium"
          title="Premium"
          titleIcon={Crown}
          subtitle="Best for active job seekers"
          price={selectedInterval === "monthly" ? "4.99" : "54.99"}
          billingInterval={selectedInterval}
          benefits={[
            "Unlimited API keys",
            "Saved AI generation history",
            `${selectedPremiumCredits} AI credits per billing period`,
          ]}
          onCheckout={startCheckout}
          isLoading={loading}
          disabled={loading}
          active={sub?.tier === "premium"}
          onPortal={openPortal}
          currentTier={sub?.tier ?? "premium"}
        />

        <div className={styles.creditCard}>
          <CirclePoundSterling className={styles.creditIcon} size={45} />

          <div className={styles.creditContent}>
            <div>
              <b>Need more AI credits?</b>
              <p>You can buy more lifetime AI credits any time.</p>
            </div>

            <ButtonOne>Buy AI Credits</ButtonOne>
          </div>
        </div>
      </div>
    </div>
  );
}
