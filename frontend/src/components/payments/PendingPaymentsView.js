"use client";

import { useEffect, useState } from "react";
import { getDashboardData } from "@/services/dashboardService";
import { getDashboardStats } from "@/lib/dashboardStats";
import PageHeader from "@/components/ui/PageHeader";
import BackLink from "@/components/ui/BackLink";
import ProgressBar from "@/components/ui/ProgressBar";
import EmptyState from "@/components/ui/EmptyState";
import { card } from "@/lib/styles";
import { formatINRFull } from "@/lib/money";

export default function PendingPaymentsView() {
    const [stats, setStats] = useState(null);

    useEffect(() => {
        getDashboardData().then((raw) => setStats(getDashboardStats(raw)));
    }, []);

    if (!stats) return <p>Loading...</p>;

    const rows = stats.activeProjects
        .map((p) => ({ ...p, pending: p.budget - p.received }))
        .filter((p) => p.pending > 0)
        .sort((a, b) => b.pending - a.pending);

    return (
        <div className="space-y-6">
            <BackLink />
            <PageHeader title="Pending Payments" subtitle={`Total to collect: ${formatINRFull(stats.pendingPayments)}`} />

            {rows.length === 0 && <EmptyState text="No pending payments." />}

            <ul className="space-y-4">
                {rows.map((p) => (
                    <li key={p.id} className={`rounded-2xl p-5 ${card}`}>
                        <div className="flex flex-wrap items-center justify-between gap-2">
                            <div>
                                <p className="text-lg font-semibold">{p.owner}</p>
                                <p className="text-sm">{p.name} • {p.location}</p>
                            </div>
                            <p className="text-2xl font-bold text-orange-500">{formatINRFull(p.pending)}</p>
                        </div>
                        <p className="mt-3 text-sm">
                            Budget {formatINRFull(p.budget)} • Received {formatINRFull(p.received)}
                        </p>
                        <div className="mt-2">
                            <ProgressBar value={Math.round((p.received / p.budget) * 100)} />
                        </div>
                    </li>
                ))}
            </ul>
        </div>
    );
}