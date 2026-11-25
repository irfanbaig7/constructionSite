"use client";

import Link from "next/link";
import { useState } from "react";
import { useQueryClient } from "@tanstack/react-query";
import {
    Building2, CalendarDays, Camera, CheckCircle2, Clock3, IndianRupee,
    MapPin, MessageCircle, PackageCheck, Phone, WalletCards,
} from "lucide-react";
import useSession from "@/hooks/useSession";
import { useProjects, useOwnerBundle } from "@/hooks/queries";
import DataState from "@/components/ui/DataState";
import StatusBadge from "@/components/ui/StatusBadge";
import ProgressBar from "@/components/ui/ProgressBar";
import EmptyState from "@/components/ui/EmptyState";
import MaterialRequests from "./MaterialRequests";
import PaymentRequests from "./PaymentRequests";
import HomeownerUpdateCard from "./HomeownerUpdateCard";
import { card } from "@/lib/styles";
import { formatINR, formatUpdateTime } from "@/lib/format";
import { formatDate } from "@/lib/date";
import { sumAmount } from "@/lib/money";

const DAY = 86400000;
const OPEN_MATERIAL = ["pending", "owner_bringing", "quote_needed", "awaiting_payment"];

function Metric({ icon: Icon, label, value, note }) {
    return (
        <div className="rounded-2xl border border-white/10 bg-black/10 p-4 light:border-slate-200 light:bg-slate-50">
            <div className="flex items-center gap-2 text-sm font-medium text-white/65 light:text-slate-600">
                <Icon size={17} aria-hidden /><span>{label}</span>
            </div>
            <p className="mt-2 text-2xl font-bold tracking-tight">{value}</p>
            {note && <p className="mt-1 text-sm text-white/60 light:text-slate-500">{note}</p>}
        </div>
    );
}

function SectionTitle({ eyebrow, title, note }) {
    return (
        <div>
            <p className="text-sm font-semibold uppercase tracking-[0.16em] text-orange-500">{eyebrow}</p>
            <h2 className="mt-1 text-xl font-bold tracking-tight sm:text-2xl">{title}</h2>
            {note && <p className="mt-1 max-w-2xl text-sm text-white/60 light:text-slate-600">{note}</p>}
        </div>
    );
}

function View({ b }) {
    const qc = useQueryClient();
    const refresh = () => qc.invalidateQueries();
    if (!b.d) return <EmptyState text="Project not found." />;

    const { project: p, payments, updates } = b.d;
    const received = sumAmount(payments);
    const ownerExpenses = sumAmount(b.e);
    const paymentPercent = Math.min(100, Math.round((received / p.budget) * 100));
    const totalDays = Math.max(0, Math.round((new Date(p.expectedEnd) - new Date(p.startDate)) / DAY));
    const daysLeft = Math.round((new Date(p.expectedEnd) - new Date()) / DAY);
    const timeNote = p.status === "completed" ? "Project completed" : daysLeft >= 0 ? `${daysLeft} days remaining` : `${-daysLeft} days overdue`;
    const phone = (p.contractorPhone ?? "").replace(/\D/g, "");
    const latest = updates[0];
    const paymentActions = b.pr.filter((r) => r.status === "pending").length;
    const materialActions = b.r.filter((r) => r.status !== "quote_needed" && OPEN_MATERIAL.includes(r.status)).length;
    const actionCount = paymentActions + materialActions;
    const hasOpenRequests = b.pr.some((r) => r.status === "pending")
        || b.r.some((r) => r.status === "paid_awaiting_delivery" || OPEN_MATERIAL.includes(r.status));

    const summary = (
            <section className="overflow-hidden rounded-3xl border border-orange-500/25 bg-gradient-to-br from-orange-500/15 via-white/5 to-blue-500/10 p-5 shadow-2xl shadow-black/10 light:from-orange-50 light:via-white light:to-blue-50 sm:p-7">
                <div className="flex flex-col gap-6 lg:flex-row lg:items-start lg:justify-between">
                    <div className="min-w-0">
                        <div className="flex flex-wrap items-center gap-3">
                            <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-orange-500 text-white shadow-lg shadow-orange-500/20"><Building2 size={24} aria-hidden /></div>
                            <div>
                                <div className="flex flex-wrap items-center gap-2"><h2 className="text-2xl font-bold tracking-tight">{p.name}</h2><StatusBadge status={p.status} /></div>
                                <p className="mt-1 flex items-center gap-1.5 text-sm text-white/60 light:text-slate-600"><MapPin size={15} aria-hidden />{p.location}</p>
                            </div>
                        </div>
                        <div className="mt-6 max-w-xl">
                            <div className="mb-2 flex items-center justify-between text-sm"><span className="font-semibold">Overall work progress</span><span className="font-bold text-orange-500">{p.progress}%</span></div>
                            <ProgressBar value={p.progress} showLabel={false} tone="orange" label="Overall work progress" />
                            <div className="mt-3 flex flex-wrap gap-x-5 gap-y-2 text-sm text-white/65 light:text-slate-600">
                                <span className="flex items-center gap-1.5"><CalendarDays size={15} aria-hidden />Target: {formatDate(p.expectedEnd)}</span>
                                <span className={`flex items-center gap-1.5 font-medium ${daysLeft < 0 && p.status !== "completed" ? "text-red-400 light:text-red-600" : ""}`}><Clock3 size={15} aria-hidden />{timeNote}</span>
                            </div>
                        </div>
                    </div>
                    {phone && <div className="flex flex-wrap gap-2">
                        <a href={`tel:+91${phone}`} className="inline-flex min-h-11 items-center gap-2 rounded-xl bg-orange-500 px-4 py-2.5 text-sm font-semibold text-white hover:bg-orange-600"><Phone size={17} aria-hidden />Call contractor</a>
                        <a href={`https://wa.me/91${phone}`} target="_blank" rel="noreferrer" className="inline-flex min-h-11 items-center gap-2 rounded-xl border border-white/15 px-4 py-2.5 text-sm font-semibold hover:border-orange-500 light:border-slate-300"><MessageCircle size={17} aria-hidden />WhatsApp</a>
                    </div>}
                </div>
                <div className="mt-7 grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
                    <Metric icon={IndianRupee} label="Agreed budget" value={formatINR(p.budget)} note="Total contract value" />
                    <Metric icon={WalletCards} label="Paid to contractor" value={formatINR(received)} note={`${paymentPercent}% of budget paid`} />
                    <Metric icon={CalendarDays} label="Project duration" value={`${Math.max(1, Math.round(totalDays / 30))} months`} note={`${formatDate(p.startDate)} – ${formatDate(p.expectedEnd)}`} />
                    <Metric icon={Camera} label="Latest proof" value={latest ? formatUpdateTime(latest.at) : "Not posted"} note={latest ? `${latest.photos.length} site photos` : "Waiting for first update"} />
                </div>
            </section>
    );

    return (
        <div className="space-y-10 pb-8">
            <section id="updates" className="scroll-mt-24 space-y-4">
                <SectionTitle eyebrow="Latest from site" title="See what happened at your site" note="Daily progress, people on site, and photo proof—even when you cannot be there in person." />
                {updates.length === 0 ? <EmptyState text="No work updates have been posted yet." /> : (
                    <div className="space-y-4">
                        <HomeownerUpdateCard update={latest} latest />

                        {updates.length > 1 && (
                            <div className="flex justify-center pt-1">
                                <Link href={`/homeowner/updates/${p.id}`} className="inline-flex min-h-11 items-center rounded-xl border border-white/15 px-5 py-2.5 text-sm font-semibold transition hover:border-orange-500 hover:text-orange-500 light:border-slate-300">
                                    View more updates
                                </Link>
                            </div>
                        )}
                    </div>
                )}
            </section>

            <section id="actions" className="scroll-mt-24 space-y-4">
                <div className="flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
                    <SectionTitle eyebrow="Action centre" title={actionCount ? `${actionCount} item${actionCount === 1 ? "" : "s"} need your attention` : "You're all caught up"} note="Payments and material decisions that are waiting for you." />
                    {actionCount > 0 && <span className="w-fit rounded-full bg-orange-500/15 px-3 py-1.5 text-sm font-semibold text-orange-500">{actionCount} open</span>}
                </div>
                {!hasOpenRequests ? (
                    <div className={`flex items-center gap-3 rounded-2xl p-5 ${card}`}><CheckCircle2 className="text-green-500" size={24} aria-hidden /><div><p className="font-semibold">No pending approvals or payments</p><p className="text-sm text-white/60 light:text-slate-600">The next request will appear here.</p></div></div>
                ) : (
                    <div className="grid gap-4 lg:grid-cols-2"><PaymentRequests projectId={p.id} requests={b.pr} onChanged={refresh} /><MaterialRequests projectId={p.id} requests={b.r} onChanged={refresh} /></div>
                )}
            </section>

            <section id="overview" className="scroll-mt-24 space-y-4">
                <SectionTitle eyebrow="Project overview" title="Money and materials, without the clutter" note="High-level numbers first; detailed records stay one tap away." />
                <div className="grid gap-4 lg:grid-cols-2">
                    <article className={`rounded-2xl p-5 sm:p-6 ${card}`}>
                        <div className="flex justify-between"><div><p className="text-sm text-white/60 light:text-slate-600">Paid to contractor</p><p className="mt-1 text-3xl font-bold">{formatINR(received)}</p></div><WalletCards className="text-orange-500" aria-hidden /></div>
                        <div className="mt-5"><ProgressBar value={paymentPercent} showLabel={false} tone="orange" label="Budget paid" /></div>
                        <div className="mt-3 flex justify-between gap-4 text-sm"><span className="text-white/60 light:text-slate-600">Remaining balance</span><strong>{formatINR(p.budget - received)}</strong></div>
                        <div className="mt-2 flex justify-between gap-4 text-sm"><span className="text-white/60 light:text-slate-600">Your additional expenses</span><strong>{formatINR(ownerExpenses)}</strong></div>
                        <Link href={`/homeowner/expenses/${p.id}`} className="mt-5 inline-flex min-h-11 items-center rounded-xl border border-white/15 px-4 py-2.5 text-sm font-semibold hover:border-orange-500 light:border-slate-300">View expense details</Link>
                    </article>
                    <article className={`rounded-2xl p-5 sm:p-6 ${card}`}>
                        <div className="flex justify-between"><div><p className="text-sm text-white/60 light:text-slate-600">Materials tracked</p><p className="mt-1 text-3xl font-bold">{b.m.length}</p></div><PackageCheck className="text-blue-400 light:text-blue-600" aria-hidden /></div>
                        {b.m.length === 0 ? <p className="mt-5 text-sm text-white/60 light:text-slate-600">Usage will appear after the first delivery and site update.</p> : <div className="mt-5 space-y-4">{b.m.slice(0, 4).map((m) => {
                            const pct = m.target > 0 ? Math.min(100, Math.round((m.used / m.target) * 100)) : 0;
                            return <div key={m.id}><div className="mb-1.5 flex justify-between gap-4 text-sm"><strong>{m.name}</strong><span className="text-white/60 light:text-slate-600">{m.used.toLocaleString("en-IN")} {m.unit}{m.target > 0 ? ` of ${m.target.toLocaleString("en-IN")}` : " used"}</span></div>{m.target > 0 && <ProgressBar value={pct} showLabel={false} label={`${m.name} usage`} />}</div>;
                        })}</div>}
                    </article>
                </div>
                <div className={`grid gap-4 rounded-2xl p-5 sm:grid-cols-2 lg:grid-cols-4 ${card}`}>
                    <div><p className="text-sm text-white/60 light:text-slate-600">Built by</p><p className="mt-1 font-semibold">{p.contractor ?? "–"}</p></div>
                    <div><p className="text-sm text-white/60 light:text-slate-600">Project type</p><p className="mt-1 font-semibold">{p.type || "–"}</p></div>
                    <div><p className="text-sm text-white/60 light:text-slate-600">Contractor payments</p><p className="mt-1 font-semibold">{formatINR(received)}</p></div>
                    <div><p className="text-sm text-white/60 light:text-slate-600">Total cash outflow</p><p className="mt-1 font-semibold">{formatINR(received + ownerExpenses)}</p></div>
                </div>
            </section>
            {summary}
        </div>
    );
}

export default function HomeDashboard() {
    const session = useSession();
    const projects = useProjects();
    const [choice, setChoice] = useState(null);
    const selectedId = projects.data?.some((project) => project.id === choice) ? choice : projects.data?.[0]?.id;
    const bundle = useOwnerBundle(selectedId);

    if (!session) return <p className="py-12 text-center text-sm">Loading your dashboard…</p>;
    return (
        <DataState query={projects}>{(list) => list.length === 0 ? (
            <EmptyState text={`No projects are linked to your email (${session.email}). Ask your contractor to use this email when creating the project.`} />
        ) : (
            <div className="space-y-8">
                <header>
                    <p className="text-sm text-white/60 light:text-slate-600">Welcome back, {session.name.split(" ")[0]}</p>
                    <h1 className="mt-1 text-3xl font-bold tracking-tight sm:text-4xl">Your project, at a glance</h1>
                    <p className="mt-2 text-sm text-white/60 light:text-slate-600">See what changed, what needs you, and where the budget stands.</p>
                    {list.length > 1 && (
                        <label className="mt-4 block max-w-sm text-sm font-semibold">
                            Viewing project
                            <select value={selectedId} onChange={(event) => setChoice(event.target.value)}
                                className="mt-1 block min-h-11 w-full rounded-xl border border-white/15 bg-[#151b29] px-3 light:border-slate-300 light:bg-white">
                                {list.map((project) => <option key={project.id} value={project.id}>{project.name}</option>)}
                            </select>
                        </label>
                    )}
                </header>
                <DataState query={bundle}>{(b) => <View b={b} />}</DataState>
            </div>

        )}</DataState>
    );
}
