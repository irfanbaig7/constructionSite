"use client";

import { Camera, CheckCircle2, Clock3, HardHat, PackageCheck, Truck } from "lucide-react";
import { useUpdate } from "@/hooks/queries";
import DataState from "@/components/ui/DataState";
import BackLink from "@/components/ui/BackLink";
import PhotoStrip from "@/components/ui/PhotoStrip";
import { card } from "@/lib/styles";
import { formatUpdateTime } from "@/lib/format";

function InfoCard({ icon: Icon, title, children, tone = "orange" }) {
    const iconTone = tone === "green" ? "bg-green-500/15 text-green-400 light:text-green-700" : tone === "blue" ? "bg-blue-500/15 text-blue-400 light:text-blue-700" : "bg-orange-500/15 text-orange-500";
    return (
        <section className={`rounded-2xl p-5 sm:p-6 ${card}`}>
            <div className="flex items-center gap-3">
                <span className={`flex h-10 w-10 items-center justify-center rounded-xl ${iconTone}`}><Icon size={20} aria-hidden /></span>
                <h2 className="font-bold">{title}</h2>
            </div>
            <div className="mt-4">{children}</div>
        </section>
    );
}

export default function UpdateDetailView({ updateId }) {
    return (
        <div className="mx-auto max-w-5xl space-y-6 pb-8">
            <BackLink href="/homeowner/dashboard">Back to project</BackLink>
            <DataState query={useUpdate(updateId)} notFound="Update not found.">
                {({ update: u, project }) => (
                    <>
                        <header className="flex flex-col gap-4 border-b border-white/10 pb-6 light:border-slate-200 sm:flex-row sm:items-end sm:justify-between">
                            <div>
                                <p className="text-sm font-semibold uppercase tracking-[0.16em] text-orange-500">Daily site update</p>
                                <h1 className="mt-2 text-3xl font-bold tracking-tight sm:text-4xl">{formatUpdateTime(u.at)}</h1>
                                <p className="mt-2 text-base text-white/60 light:text-slate-600">{project.name}</p>
                            </div>
                            <div className="flex items-center gap-2 rounded-xl bg-green-500/10 px-3 py-2 text-sm font-semibold text-green-400 light:text-green-700">
                                <CheckCircle2 size={17} aria-hidden /> Photo proof included
                            </div>
                        </header>

                        <div className="grid gap-5 lg:grid-cols-[1.35fr_0.85fr]">
                            <section className={`rounded-3xl p-3 sm:p-4 ${card}`}>
                                <div className="mb-3 flex items-center justify-between gap-4 px-1">
                                    <div className="flex items-center gap-2"><Camera size={18} className="text-orange-500" aria-hidden /><h2 className="font-bold">Site proof</h2></div>
                                    <span className="text-sm text-white/55 light:text-slate-500">{u.photos.length} {u.photos.length === 1 ? "photo" : "photos"}</span>
                                </div>
                                <PhotoStrip photos={u.photos} featured />
                            </section>

                            <div className="space-y-5">
                                <InfoCard icon={CheckCircle2} title="Work completed" tone="green">
                                    <p className="text-lg leading-8">{u.summary}</p>
                                </InfoCard>
                                <InfoCard icon={HardHat} title="Workforce" tone="blue">
                                    <p className="text-3xl font-bold">{u.workers}</p>
                                    <p className="mt-1 text-sm text-white/60 light:text-slate-600">workers were present on site</p>
                                </InfoCard>
                                <div className={`flex items-center gap-3 rounded-2xl p-4 ${card}`}>
                                    <Clock3 size={20} className="text-orange-500" aria-hidden />
                                    <div><p className="text-sm text-white/60 light:text-slate-600">Update recorded</p><p className="font-semibold">{formatUpdateTime(u.at)}</p></div>
                                </div>
                            </div>
                        </div>

                        <div className={`grid gap-5 ${u.deliveries?.length > 0 ? "lg:grid-cols-2" : ""}`}>
                            <InfoCard icon={PackageCheck} title="Materials used" tone="orange">
                                {u.materials.length === 0 ? (
                                    <p className="text-sm text-white/60 light:text-slate-600">No materials were recorded for this update.</p>
                                ) : (
                                    <div className="flex flex-wrap gap-2">
                                        {u.materials.map((material) => (
                                            <span key={material} className="rounded-xl border border-white/10 bg-white/5 px-3 py-2 text-sm font-semibold light:border-slate-200 light:bg-slate-50">{material}</span>
                                        ))}
                                    </div>
                                )}
                            </InfoCard>

                            {u.deliveries?.length > 0 && (
                                <InfoCard icon={Truck} title="New material deliveries" tone="blue">
                                    <ul className="space-y-3">
                                        {u.deliveries.map((delivery, index) => (
                                            <li key={`${delivery.name}-${index}`} className="flex items-start justify-between gap-4 rounded-xl bg-white/5 p-3 light:bg-slate-50">
                                                <div><p className="font-semibold capitalize">{delivery.name}</p><p className="mt-1 text-sm text-white/60 light:text-slate-600">{delivery.by === "owner" ? "Arranged by you" : "Arranged by contractor · Payment completed"}</p></div>
                                                <span className="shrink-0 font-bold">{delivery.quantity} {delivery.unit}</span>
                                            </li>
                                        ))}
                                    </ul>
                                </InfoCard>
                            )}
                        </div>
                    </>
                )}
            </DataState>
        </div>
    );
}
