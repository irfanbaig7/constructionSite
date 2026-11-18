"use client";

import { useEffect, useState } from "react";
import { getOwnerProjectDetails } from "@/services/projectService";
import BackLink from "@/components/ui/BackLink";
import Thumb from "@/components/ui/Thumb";
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

export default function UpdateDetailView({ id, updateId }) {
    const [data, setData] = useState(undefined);

    useEffect(() => {
        getOwnerProjectDetails(id).then(setData);
    }, [id]);

    const back = <BackLink href="/homeowner/dashboard">← Back to Project</BackLink>;
    if (data === undefined) return <p>Loading...</p>;

    const u = data?.updates.find((x) => x.id === updateId);
    if (!u) {
        return (
            <div className="space-y-4">
                {back}
                <p>Update not found.</p>
            </div>
        );
    }

    const photos = Array.isArray(u.photos) ? u.photos : [];

    return (
        <div className="space-y-6">
            {back}
            <div>
                <h1 className="text-2xl font-bold sm:text-3xl">{formatUpdateTime(u.at)}</h1>
                <p className="mt-1 text-sm">{data.project.name}</p>
            </div>

            <div className="grid gap-6 lg:grid-cols-2">
                {/* Photos */}
                <Block title="Photos">
                    {photos.length > 0 ? (
                        <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
                            {photos.map((src, i) => (
                                // eslint-disable-next-line @next/next/no-img-element
                                <img key={i} src={src} alt={`Site photo ${i + 1}`} className="aspect-[4/3] w-full rounded-xl object-cover" />
                            ))}
                        </div>
                    ) : (
                        <div className="flex gap-3">
                            {Array.from({ length: u.photos || 0 }).map((_, i) => (
                                <Thumb key={i} icon="📷" className="h-24 w-24" />
                            ))}
                            {!u.photos && <p className="text-sm">No photos.</p>}
                        </div>
                    )}
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
                    )}
                </div>
            </div>
        </div>
    );
}