"use client";

import { useEffect, useState } from "react";
import { getDashboardData } from "@/services/dashboardService";
import { getLowStock } from "@/lib/stock";
import { notifyLowStock, getNotifications } from "@/services/notificationService";
import PageHeader from "@/components/ui/PageHeader";
import BackLink from "@/components/ui/BackLink";
import PrimaryButton from "@/components/ui/PrimaryButton";
import EmptyState from "@/components/ui/EmptyState";
import { card } from "@/lib/styles";

const keyOf = (i) => `${i.projectId}:${i.material}`;

export default function LowStockView() {
    const [items, setItems] = useState(null);
    const [sent, setSent] = useState(new Set());

    useEffect(() => {
        getDashboardData().then(({ projects, details }) => setItems(getLowStock(projects, details)));
        setSent(new Set(getNotifications().map((n) => `${n.projectId}:${n.material}`)));
    }, []);

    function notify(item) {
        notifyLowStock(item);
        setSent((prev) => new Set(prev).add(keyOf(item)));
    }

    if (!items) return <p>Loading...</p>;

    // group by site
    const groups = items.reduce((acc, i) => {
        (acc[i.projectId] ??= { project: i.project, owner: i.owner, list: [] }).list.push(i);
        return acc;
    }, {});

    return (
        <div className="space-y-6">
            <BackLink />
            <PageHeader title="Low Stock" subtitle={`${items.length} materials need reorder`} />

            {items.length === 0 && <EmptyState text="All stock is fine." />}

            {Object.entries(groups).map(([id, g]) => (
                <section key={id} className={`rounded-2xl p-5 ${card}`}>
                    <h2 className="text-lg font-bold">{g.project}</h2>
                    <p className="text-sm">Owner: {g.owner}</p>
                    <ul className="mt-4 divide-y divide-white/10 light:divide-slate-200">
                        {g.list.map((i) => (
                            <li key={i.material} className="flex flex-wrap items-center justify-between gap-3 py-3">
                                <div>
                                    <p className="font-semibold">{i.material}</p>
                                    <p className="text-sm">
                                        In stock {i.stock} {i.unit} • Minimum {i.minStock} {i.unit}
                                    </p>
                                </div>
                                {sent.has(keyOf(i)) ? (
                                    <span className="text-sm font-semibold text-green-500">✓ Homeowner notified</span>
                                ) : (
                                    <PrimaryButton onClick={() => notify(i)}>Notify homeowner</PrimaryButton>
                                )}
                            </li>
                        ))}
                    </ul>
                </section>
            ))}
        </div>
    );
}