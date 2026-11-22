"use client";

import { useEffect, useState } from "react";
import { getUpdate } from "@/services/projectService";
import BackLink from "@/components/ui/BackLink";
import PhotoStrip from "@/components/ui/PhotoStrip";
import { card } from "@/lib/styles";
import { formatUpdateTime } from "@/lib/format";

function Block({ title, children }) {
    return (
        <section className={`rounded-2xl p-5 ${card}`}>
            <h2 className="text-sm font-bold uppercase tracking-wide">{title}</h2>
            <div className="mt-3">{children}</div>
        </section>
    );
}

export default function UpdateDetailView({ updateId }) {
    const [data, setData] = useState(undefined);

    useEffect(() => {
        getUpdate(updateId).then(setData).catch(() => setData(null));
    }, [updateId]);

    const back = <BackLink href="/homeowner/dashboard">← Back to Project</BackLink>;
    if (data === undefined) return <p>Loading...</p>;

    const u = data?.update;
    if (!u) {
        return (
            <div className="space-y-4">
                {back}
                <p>Update not found.</p>
            </div>
        );
    }

    return (
        <div className="space-y-6">
            {back}
            <div>
                <h1 className="text-2xl font-bold sm:text-3xl">{formatUpdateTime(u.at)}</h1>
                <p className="mt-1 text-sm">{data.project.name}</p>
            </div>

            <div className="grid gap-6 lg:grid-cols-2">
                <Block title="Photos">
                    <PhotoStrip photos={u.photos} size="h-28 w-28" />
                </Block>

                <div className="space-y-4">
                    <Block title="Aaj kya kaam hua">
                        <p>{u.summary}</p>
                    </Block>

                    <Block title="Material use hua">
                        {u.materials.length === 0 ? (
                            <p className="text-sm">Koi material note nahi kiya.</p>
                        ) : (
                            <div className="flex flex-wrap gap-2">
                                {u.materials.map((m) => (
                                    <span key={m} className="rounded-full border border-white/15 px-3 py-1 text-xs font-medium light:border-slate-300">
                                        🧱 {m}
                                    </span>
                                ))}
                            </div>
                        )}
                    </Block>

                    <Block title="Workers">
                        <p className="text-lg font-semibold">👷 {u.workers} workers the is din kaam par</p>
                    </Block>

                    {u.delivered && (
                        <Block title="Naya material aaya">
                            <p className="font-semibold">🚚 {u.delivered}</p>
                        </Block>
                    )}{u.deliveries?.length > 0 && (
                        <Block title="Naya material aaya">
                            <ul className="space-y-1 font-semibold">
                                {u.deliveries.map((d, i) => (
                                    <li key={i}>🚚 {d.name} {d.quantity} {d.unit} ({d.by === "owner" ? "aapne laaye" : "contractor ke through, payment ho chuka"})</li>
                                ))}
                            </ul>
                        </Block>
                    )}
                </div>
            </div>
        </div>
    );
}