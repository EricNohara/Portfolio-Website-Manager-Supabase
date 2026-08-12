"use client";

import { useEffect, useMemo, useState } from "react";

import { useToast } from "@/app/context/ToastProvider";
import { createClient } from "@/utils/supabase/client";

import GenericAreaChart from "./GenericAreaChart";

type CreditActivityRow = {
    day: string;
    credits_added: number;
    credits_used: number;
};

type CreditLedgerChartRow = {
    name: string;
    creditsAdded: number;
    creditsUsed: number;
};

function localDateKey(date: Date) {
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, "0");
    const day = String(date.getDate()).padStart(2, "0");
    return `${year}-${month}-${day}`;
}

function formatMMDD(date: Date) {
    return `${date.getMonth() + 1}/${date.getDate()}`;
}

function buildLast7DaysSeries(rows: CreditActivityRow[]): CreditLedgerChartRow[] {
    const activityByDay = new Map(rows.map((row) => [row.day, row]));

    return Array.from({ length: 7 }, (_, index) => {
        const date = new Date();
        date.setHours(12, 0, 0, 0);
        date.setDate(date.getDate() - (6 - index));
        const row = activityByDay.get(localDateKey(date));

        return {
            name: formatMMDD(date),
            creditsAdded: Number(row?.credits_added ?? 0),
            creditsUsed: Number(row?.credits_used ?? 0),
        };
    });
}

export default function CreditLedgerChart({
    height = "100%",
}: {
    height?: number | string;
}) {
    const supabase = useMemo(() => createClient(), []);
    const toast = useToast();
    const [chartData, setChartData] = useState<CreditLedgerChartRow[]>([]);
    const [loading, setLoading] = useState(true);
    const [failed, setFailed] = useState(false);

    useEffect(() => {
        let active = true;

        const loadChartData = async () => {
            const timezone = Intl.DateTimeFormat().resolvedOptions().timeZone || "UTC";
            const { data, error } = await supabase.rpc(
                "get_ai_credit_activity_last_7_days",
                { p_timezone: timezone },
            );

            if (!active) return;

            if (error) {
                setFailed(true);
                setLoading(false);
                toast.error("Error", "Failed to load credit activity.");
                return;
            }

            setChartData(buildLast7DaysSeries((data ?? []) as CreditActivityRow[]));
            setLoading(false);
        };

        loadChartData();
        return () => {
            active = false;
        };
    }, [supabase, toast]);

    const containerStyle: React.CSSProperties = {
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        width: "100%",
        height,
        minWidth: 0,
        minHeight: 0,
        color: "var(--page-txt-2)",
    };

    if (loading) {
        return <div style={containerStyle}>Loading credit activity...</div>;
    }

    if (failed) {
        return <div style={containerStyle}>Unable to load credit activity.</div>;
    }

    if (!chartData.some((row) => row.creditsAdded > 0 || row.creditsUsed > 0)) {
        return <div style={containerStyle}>No credit activity yet</div>;
    }

    return (
        <GenericAreaChart
            data={chartData}
            xKey="name"
            series={[
                {
                    key: "creditsAdded",
                    color: "var(--success-color)",
                    name: "Credits Added",
                },
                {
                    key: "creditsUsed",
                    color: "var(--fail-color)",
                    name: "Credits Used",
                },
            ]}
            height={height}
        />
    );
}
