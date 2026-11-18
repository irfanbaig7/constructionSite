"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import useSession from "@/hooks/useSession";
import { getProjectsForOwner, getOwnerProjectDetails } from "@/services/projectService";
import { getEntries } from "@/services/ledgerService";
import StatCard from "@/components/dashboard/StatCard";
import StatusBadge from "@/components/ui/StatusBadge";
import ProgressBar from "@/components/ui/ProgressBar";
import EmptyState from "@/components/ui/EmptyState";
import Thumb from "@/components/ui/Thumb";
import { card, inputClass } from "@/lib/styles";
import { formatINR, formatUpdateTime } from "@/lib/format";
import { formatDate } from "@/lib/date";
import { sumAmount } from "@/lib/money";
import { shortTitle } from "@/lib/text";

const DAY = 86400000;
const photoCount = (u) => (Array.isArray(u.photos) ? u.photos.length : u.photos || 0);

export default function HomeDashboard() {
    const session = useSession();
    const [projects, setProjects] = useState(null);
    const [selectedId, setSelectedId] = useState(null);
    const [view, setView] = useState(null);

    useEffect(() => {
        if (!session) return;
        getProjectsForOwner(session.email).then((list) => {
            setProjects(list);
            setSelectedId(list[0]?.id ?? null);
        });
    }, [session]);

    useEffect(() => {
        if (!selectedId) return;
        Promise.all([getOwnerProjectDetails(selectedId), getEntries(selectedId)]).then(([d, e]) => setView({ d, e }));
    }, [selectedId]);

    if (!session || !projects) return <p>Loading...</p>;

    if (projects.length === 0) {
        return (
            <EmptyState text={`Abhi koi project aapke email (${session.email}) se juda nahi hai. Apne contractor se kaho ki project banate waqt yahi email daale.`} />
        );
    }

    if (!view || view.d?.project.id !== selectedId) return <p>Loading...</p>;

    const { project: p, payments, updates } = view.d;
    const received = sumAmount(payments);
    const spent = received + sumAmount(view.e);
    const totalDays = Math.max(0, Math.round((new Date(p.expectedEnd) - new Date(p.startDate)) / DAY));
    const daysLeft = Math.round((new Date(p.expectedEnd) - new Date()) / DAY);
    const timeNote =
        p.status === "completed" ? "Completed" : daysLeft >= 0 ? `${daysLeft} days left` : `${-daysLeft} days over time`;

    const phone = (p.contractorPhone ?? "").replace(/\D/g, "");
    const percent = Math.round((received / p.budget) * 100);

    const info = [
        ["Ghar bana raha hai", p.contractor ?? "-"],
        ["Location", p.location],
        ["Budget (tay hua)", formatINR(p.budget)],
        ["Time", `${formatDate(p.startDate)} → ${formatDate(p.expectedEnd)}`],
        ["Duration", `≈ ${Math.max(1, Math.round(totalDays / 30))} months • ${timeNote}`],
    ];

    return (
        <div className="space-y-6">
            {projects.length > 1 && (
                <select value={selectedId} onChange={(e) => setSelectedId(e.target.value)} className={`max-w-xs ${inputClass}`}>
                    {projects.map((x) => (
                        <option key={x.id} value={x.id}>{x.name}</option>
                    ))}
                </select>
            )}

            {/* Daily work list: sabse upar */}
            <section className={`rounded-2xl p-5 ${card}`}>
                <h2 className="text-lg font-bold">Roz ka kaam</h2>
                {updates.length === 0 ? (
                    <p className="mt-4 text-sm">Abhi koi update nahi aaya.</p>
                ) : (
                    <ul className="mt-4 max-h-96 divide-y divide-white/10 overflow-y-auto light:divide-slate-200">
                        {updates.map((u) => (
                            <li key={u.id}>
                                <Link
                                    href={`/homeowner/projects/${p.id}/updates/${u.id}`}
                                    className="flex items-center justify-between gap-3 py-3 hover:text-orange-500"
                                >
                                    <div className="min-w-0">
                                        <p className="text-xs font-medium">{formatUpdateTime(u.at)}</p>
                                        <p className="truncate font-semibold">{shortTitle(u.summary)}</p>
                                        <p className="text-xs">📷 {photoCount(u)} photos • 👷 {u.workers} workers</p>
                                    </div>
                                    <span aria-hidden className="text-2xl">›</span>
                                </Link>
                            </li>
                        ))}
                    </ul>
                )}
            </section>

            <div className="grid gap-6 lg:grid-cols-3">
                {/* Project basic info */}
                <section className={`rounded-2xl p-5 ${card}`}>
                    <div className="flex items-center gap-3">
                        <Thumb className="h-16 w-16" />
                        <div className="min-w-0">
                            <h1 className="truncate text-xl font-bold">{p.name}</h1>
                            <StatusBadge status={p.status} />
                        </div>
                    </div>
                    <dl className="mt-5 space-y-3">
                        {info.map(([k, v]) => (
                            <div key={k}>
                                <dt className="text-xs font-medium">{k}</dt>
                                <dd className="font-semibold">{v}</dd>
                            </div>
                        ))}
                    </dl>

                    {phone && (
                        <div className="mt-5 flex gap-2">
                            <a href={`tel:+91${phone}`} className="rounded-lg bg-orange-500 px-4 py-2 text-sm font-semibold text-white hover:bg-orange-600">
                                📞 Call
                            </a>
                            <a href={`https://wa.me/91${phone}`} target="_blank" rel="noreferrer"
                                className="rounded-lg border border-white/15 px-4 py-2 text-sm font-semibold hover:border-orange-500 light:border-slate-300">
                                💬 WhatsApp
                            </a>
                        </div>
                    )}

                </section>

                {/* Progress + money */}
                <div className="space-y-4 lg:col-span-2">
                    <section className={`rounded-2xl p-5 ${card}`}>
                        <p className="mb-2 text-sm font-medium">Kaam kitna hua</p>
                        <ProgressBar value={p.progress} />
                    </section>
                    <div className="grid gap-4 sm:grid-cols-3">
                        <StatCard label="Abhi tak kharcha" value={formatINR(spent)} icon="🧾" tone="orange"
                            href={`/homeowner/projects/${p.id}/expenses`} hint="Hisaab dekho / likho →" />
                        <StatCard label="Budget" value={formatINR(p.budget)} icon="💼" tone="purple" />
                        <StatCard label="Contractor ko dena baki" value={formatINR(p.budget - received)} icon="⏳" tone="blue" />
                    </div>
                </div>
            </div>
        </div>
    );
}