"use client";

import {
    CalendarClock,
    ChartNoAxesCombined,
    CirclePoundSterling,
    Info,
    ShieldCheck,
    Table2,
} from "lucide-react";
import { useEffect, useState } from "react";

import { ButtonOne } from "@/app/components/Buttons/Buttons";
import CreditLedgerChart from "@/app/components/Chart/CreditLedgerChart";
import { useToast } from "@/app/context/ToastProvider";
import { headerFont } from "@/app/localFonts";
import { createDocumentationUrl } from "@/utils/navigation/documentation";

import styles from "./AiCreditsPage.module.css";

type CreditBalance = {
    subscriptionCredits: number;
    lifetimeCredits: number;
    totalCredits: number;
    updatedAt: string | null;
};

type CreditHistoryEntry = {
    id: number;
    subscriptionDelta: number;
    lifetimeDelta: number;
    reason: string;
    createdAt: string;
};

type CreditResponse = {
    balance: CreditBalance;
    history: CreditHistoryEntry[];
    error?: string;
};

type ActivityView = "table" | "graph";

const CREDIT_REASON_LABELS: Record<string, string> = {
    signup_grant: "Signup grant",
    subscription_grant: "Subscription grant",
    subscription_expiration: "Subscription credits expired",
    credit_purchase: "Credit purchase",
    ad_reward: "Ad reward",
    agent_usage: "AI agent usage",
    refund: "Generation refund",
    admin_adjustment: "Account adjustment",
};

export default function AiCreditsPage() {
    const toast = useToast();
    const [creditBalance, setCreditBalance] = useState<CreditBalance | null>(null);
    const [creditHistory, setCreditHistory] = useState<CreditHistoryEntry[]>([]);
    const [loading, setLoading] = useState(true);
    const [activityView, setActivityView] = useState<ActivityView>("graph");

    useEffect(() => {
        const controller = new AbortController();

        const loadCredits = async () => {
            try {
                const response = await fetch("/api/internal/user/aiCredits?limit=25", {
                    method: "GET",
                    cache: "no-store",
                    signal: controller.signal,
                });
                const data = (await response.json()) as CreditResponse;

                if (!response.ok) {
                    throw new Error(data.error || "Failed to load AI credits.");
                }

                setCreditBalance(data.balance);
                setCreditHistory(data.history ?? []);
            } catch (error) {
                if (controller.signal.aborted) return;
                const message = error instanceof Error
                    ? error.message
                    : "Failed to load AI credits.";
                toast.error("Error", message);
            } finally {
                if (!controller.signal.aborted) setLoading(false);
            }
        };

        loadCredits();
        return () => controller.abort();
    }, [toast]);

    const balanceValue = (value: number | undefined) => (
        loading || value === undefined ? "—" : value
    );

    return (
        <div className={styles.container}>
            <header className={styles.pageHeader}>
                <h1 className={`${headerFont.className} ${styles.pageTitle}`}>
                    AI Credits
                </h1>

                <div className={styles.buttons}>
                    <ButtonOne onClick={() => window.location.assign(createDocumentationUrl("aiCredits", window.location.href))}>
                        <span className={styles.infoButtonContent}>
                            <Info /> More Information
                        </span>
                    </ButtonOne>
                </div>
            </header >

            <div className={styles.creditSummaryGrid}>
                <div className={styles.creditSummaryCard}>
                    <CalendarClock size={24} aria-hidden="true" />
                    <span>Subscription</span>
                    <strong>{balanceValue(creditBalance?.subscriptionCredits)}</strong>
                </div>
                <div className={styles.creditSummaryCard}>
                    <ShieldCheck size={24} aria-hidden="true" />
                    <span>Lifetime</span>
                    <strong>{balanceValue(creditBalance?.lifetimeCredits)}</strong>
                </div>
                <div className={`${styles.creditSummaryCard} ${styles.totalCreditCard}`}>
                    <CirclePoundSterling size={24} aria-hidden="true" />
                    <span>Total available</span>
                    <strong>{balanceValue(creditBalance?.totalCredits)}</strong>
                </div>
            </div>

            <section className={styles.activityPanel} aria-labelledby="credit-activity-heading">
                <div className={styles.activityHeader}>
                    <h2 id="credit-activity-heading" className={headerFont.className}>
                        Credit activity
                    </h2>
                    <div className={styles.viewToggle} aria-label="Credit activity view">
                        <button
                            type="button"
                            className={`${styles.toggleButton} ${activityView === "graph" ? styles.activeToggle : ""}`}
                            aria-pressed={activityView === "graph"}
                            onClick={() => setActivityView("graph")}
                        >
                            <ChartNoAxesCombined size={16} aria-hidden="true" />
                            Graph
                        </button>
                        <button
                            type="button"
                            className={`${styles.toggleButton} ${activityView === "table" ? styles.activeToggle : ""}`}
                            aria-pressed={activityView === "table"}
                            onClick={() => setActivityView("table")}
                        >
                            <Table2 size={16} aria-hidden="true" />
                            Table
                        </button>
                    </div>
                </div>

                <div className={styles.activityContent}>
                    {activityView === "graph" ? (
                        <CreditLedgerChart height="100%" />
                    ) : loading ? (
                        <div className={styles.activityState}>Loading credit activity...</div>
                    ) : creditHistory.length === 0 ? (
                        <div className={styles.activityState}>No credit activity yet</div>
                    ) : (
                        <div className={styles.historyTableWrapper}>
                            <table className={styles.historyTable}>
                                <thead>
                                    <tr>
                                        <th>Activity</th>
                                        <th>Credits</th>
                                        <th>Date</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {creditHistory.map((entry) => {
                                        const delta = entry.subscriptionDelta + entry.lifetimeDelta;
                                        return (
                                            <tr key={entry.id}>
                                                <td>{CREDIT_REASON_LABELS[entry.reason] ?? entry.reason}</td>
                                                <td className={delta > 0 ? styles.positiveDelta : styles.negativeDelta}>
                                                    {delta > 0 ? "+" : ""}{delta}
                                                </td>
                                                <td>{new Date(entry.createdAt).toLocaleDateString()}</td>
                                            </tr>
                                        );
                                    })}
                                </tbody>
                            </table>
                        </div>
                    )}
                </div>
            </section>
        </div >
    );
}
