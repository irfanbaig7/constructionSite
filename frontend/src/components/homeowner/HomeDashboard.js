
"use client";

import { useState } from "react";
import Link from "next/link";
import { useQueryClient } from "@tanstack/react-query";
import useSession from "@/hooks/useSession";
import { useProjects, useOwnerBundle } from "@/hooks/queries";
import DataState from "@/components/ui/DataState";
import StatCard from "@/components/dashboard/StatCard";
import StatusBadge from "@/components/ui/StatusBadge";
import ProgressBar from "@/components/ui/ProgressBar";
import EmptyState from "@/components/ui/EmptyState";
import Thumb from "@/components/ui/Thumb";
import MaterialRequests from "./MaterialRequests";
import PaymentRequests from "./PaymentRequests";
import { card, inputClass } from "@/lib/styles";
import { formatINR, formatUpdateTime } from "@/lib/format";
import { formatDate } from "@/lib/date";
import { sumAmount } from "@/lib/money";
import { shortTitle } from "@/lib/text";

const DAY = 86400000;

function View({ b, list, selectedId, onPick }) {
    const qc = useQueryClient();
    const refresh = () => qc.invalidateQueries();
    if (!b.d) return <EmptyState text="Project not found." />;

    const { project: p, payments, updates } = b.d;
    const received = sumAmount(payments);
    const totalDays = Math.max(0, Math.round((new Date(p.expectedEnd) - new Date(p.startDate)) / DAY));
    const daysLeft = Math.round((new Date(p.expectedEnd) - new Date()) / DAY);
    const timeNote = p.status === "completed" ? "Completed" : daysLeft >= 0 ? `${daysLeft} days left` : `${-daysLeft} days overdue`;
    const phone = (p.contractorPhone ?? "").replace(/\D/g, "");

    const info = [
        ["Built by", p.contractor ?? "-"],
        ["Location", p.location],
        ["Agreed Budget", formatINR(p.budget)],
        ["Timeline", `${formatDate(p.startDate)} → ${formatDate(p.expectedEnd)}`],
        ["Duration", `≈ ${Math.max(1, Math.round(totalDays / 30))} months • ${timeNote}`],
    ];

    return (
        <div className="space-y-6">
            {list.length > 1 && (
                <select value={selectedId} onChange={(e) => onPick(e.target.value)} className={`max-w-xs ${inputClass}`}>
                    {list.map((x) => <option key={x.id} value={x.id}>{x.name}</option>)}
                </select>
            )}

            <PaymentRequests projectId={p.id} requests={b.pr} onChanged={refresh} />
            <MaterialRequests projectId={p.id} requests={b.r} onChanged={refresh} />

            <section className={`rounded-2xl p-5 ${card}`}>
                <h2 className="text-lg font-bold">Daily Work Updates</h2>
                {updates.length === 0 ? (
                    <p className="mt-4 text-sm">No updates have been posted yet.</p>
                ) : (
                    <ul className="mt-4 max-h-96 divide-y divide-white/10 overflow-y-auto light:divide-slate-200">
                        {updates.map((u) => (
                            <li key={u.id}>
                                <Link href={`/homeowner/update/${u.id}`} className="flex items-center justify-between gap-3 py-3 hover:text-orange-500">
                                    <div className="min-w-0">
                                        <p className="text-xs font-medium">{formatUpdateTime(u.at)}</p>
                                        <p className="truncate font-semibold">{shortTitle(u.summary)}</p>
                                        <p className="text-xs">📷 {u.photos.length} photos • 👷 {u.workers} workers</p>
                                    </div>
                                    <span aria-hidden className="text-2xl">›</span>
                                </Link>
                            </li>
                        ))}
                    </ul>
                )}
            </section>

            <div className="grid gap-6 lg:grid-cols-3">
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
                            <div key={k}><dt className="text-xs font-medium">{k}</dt><dd className="font-semibold">{v}</dd></div>
                        ))}
                    </dl>
                    {phone && (
                        <div className="mt-5 flex gap-2">
                            <a href={`tel:+91${phone}`} className="rounded-lg bg-orange-500 px-4 py-2 text-sm font-semibold text-white hover:bg-orange-600">📞 Call</a>
                            <a href={`https://wa.me/91${phone}`} target="_blank" rel="noreferrer" className="rounded-lg border border-white/15 px-4 py-2 text-sm font-semibold hover:border-orange-500 light:border-slate-300">💬 WhatsApp</a>
                        </div>
                    )}
                </section>

                <div className="space-y-4 lg:col-span-2">
                    <section className={`rounded-2xl p-5 ${card}`}>
                        <p className="mb-2 text-sm font-medium">Work Progress</p>
                        <ProgressBar value={p.progress} />
                    </section>
                    <section className={`rounded-2xl p-5 ${card}`}>
                        <div className="flex flex-wrap items-end justify-between gap-2">
                            <div>
                                <p className="text-sm font-medium">Paid to Contractor</p>
                                <p className="text-3xl font-bold">{formatINR(received)}</p>
                            </div>
                            <p className="text-sm">Budget {formatINR(p.budget)} • <span className="font-semibold">Remaining {formatINR(p.budget - received)}</span></p>
                        </div>
                        <div className="mt-3"><ProgressBar value={Math.round((received / p.budget) * 100)} /></div>
                    </section>
                    <StatCard label="Total Expenses So Far" value={formatINR(received + sumAmount(b.e))} icon="🧾" tone="orange"
                        href={`/homeowner/expenses/${p.id}`} hint="View / manage expense details →" />
                </div>
            </div>

            <section className={`rounded-2xl p-5 ${card}`}>
                <h2 className="text-lg font-bold">Material Usage</h2>
                {b.m.length === 0 ? (
                    <p className="mt-3 text-sm">No materials have arrived at the site yet.</p>
                ) : (
                    <div className="mt-4 space-y-4">
                        {b.m.map((m) => (
                            <div key={m.id}>
                                <p className="text-sm font-semibold">
                                    {m.name}: {m.used.toLocaleString("en-IN")} {m.unit} used{m.target > 0 && `, ${m.target.toLocaleString("en-IN")} ${m.unit} required in total`}
                                </p>
                                {m.target > 0 && <ProgressBar value={Math.min(100, Math.round((m.used / m.target) * 100))} />}
                            </div>
                        ))}
                    </div>
                )}
            </section>
        </div>
    );
}

export default function HomeDashboard() {
    const session = useSession();
    const projects = useProjects();
    const [picked, setPicked] = useState(null);
    const selectedId = picked ?? projects.data?.[0]?.id;
    const bundle = useOwnerBundle(selectedId);

    if (!session) return <p>Loading...</p>;
    return (
        <DataState query={projects}>
            {(list) =>
                list.length === 0 ? (
                    <EmptyState text={`No projects are linked to your email (${session.email}). Ask your contractor to use this email when creating the project.`} />
                ) : (
                    <DataState query={bundle}>{(b) => <View b={b} list={list} selectedId={selectedId} onPick={setPicked} />}</DataState>
                )
            }
        </DataState>
    );
}
