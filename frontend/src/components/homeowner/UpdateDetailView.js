
"use client";

import { useUpdate } from "@/hooks/queries";
import DataState from "@/components/ui/DataState";
import BackLink from "@/components/ui/BackLink";
import PhotoStrip from "@/components/ui/PhotoStrip";
import { card } from "@/lib/styles";
import { formatUpdateTime } from "@/lib/format";

const Block = ({ title, children }) => (
    <section className={`rounded-2xl p-5 ${card}`}>
        <h2 className="text-sm font-bold uppercase tracking-wide">{title}</h2>
        <div className="mt-3">{children}</div>
    </section>
);

export default function UpdateDetailView({ updateId }) {
    return (
        <div className="space-y-6">
            <BackLink href="/homeowner/dashboard">← Back to Project</BackLink>
            <DataState query={useUpdate(updateId)} notFound="Update not found.">
                {({ update: u, project }) => (
                    <>
                        <div>
                            <h1 className="text-2xl font-bold sm:text-3xl">{formatUpdateTime(u.at)}</h1>
                            <p className="mt-1 text-sm">{project.name}</p>
                        </div>
                        <div className="grid gap-6 lg:grid-cols-2">
                            <Block title="Photos"><PhotoStrip photos={u.photos} size="h-28 w-28" /></Block>
                            <div className="space-y-4">
                                <Block title="Work Completed Today"><p>{u.summary}</p></Block>
                                <Block title="Materials Used">
                                    {u.materials.length === 0 ? (
                                        <p className="text-sm">No materials were recorded.</p>
                                    ) : (
                                        <div className="flex flex-wrap gap-2">
                                            {u.materials.map((m) => (
                                                <span key={m} className="rounded-full border border-white/15 px-3 py-1 text-xs font-medium light:border-slate-300">🧱 {m}</span>
                                            ))}
                                        </div>
                                    )}
                                </Block>
                                <Block title="Workforce"><p className="text-lg font-semibold">👷 {u.workers} workers present on this day</p></Block>
                                {u.deliveries?.length > 0 && (
                                    <Block title="New Material Deliveries">
                                        <ul className="space-y-1 font-semibold">
                                            {u.deliveries.map((d, i) => (
                                                <li key={i}>🚚 {d.name} {d.quantity} {d.unit} ({d.by === "owner" ? "Arranged by you" : "Arranged by contractor — payment completed"})</li>
                                            ))}
                                        </ul>
                                    </Block>
                                )}
                            </div>
                        </div>
                    </>
                )}
            </DataState>
        </div>
    );
}
