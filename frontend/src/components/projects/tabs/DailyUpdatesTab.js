"use client";

import { useEffect, useState } from "react";
import EmptyState from "@/components/ui/EmptyState";
import Thumb from "@/components/ui/Thumb";
import { card } from "@/lib/styles";
import { formatUpdateTime } from "@/lib/format";
import { getWorkers } from "@/services/workerService";

export default function DailyUpdatesTab({ updates }) {
    const [names, setNames] = useState({});

    useEffect(() => {
        getWorkers().then((w) => setNames(Object.fromEntries(w.map((x) => [x.id, x.name]))));
    }, []);

    if (updates.length === 0) return <EmptyState text="No daily updates yet." />;

    return (
        <ul className="space-y-4">
            {updates.map((u) => (
                <li key={u.id} className={`rounded-2xl p-5 ${card}`}>
                    <div className="flex flex-wrap items-center justify-between gap-2">
                        <p className="font-semibold">{formatUpdateTime(u.at)}</p>
                        <p className="text-sm">👷 {u.workers} workers present</p>
                    </div>
                    <p className="mt-2">{u.summary}</p>

                    {u.workerIds?.length > 0 && (
                        <div className="mt-3 flex flex-wrap gap-2">
                            {u.workerIds.map((id) => (
                                <span key={id} className="rounded-full bg-orange-500/10 px-3 py-1 text-xs font-medium text-orange-500">
                                    {names[id] ?? "Worker"}
                                </span>
                            ))}
                        </div>
                    )}

                    {u.materials.length > 0 && (
                        <div className="mt-3 flex flex-wrap gap-2">
                            {u.materials.map((m) => (
                                <span key={m} className="rounded-full border border-white/15 px-3 py-1 text-xs font-medium light:border-slate-300">
                                    🧱 {m}
                                </span>
                            ))}
                        </div>
                    )}

                    {u.delivered && <p className="mt-3 text-sm font-semibold">🚚 Received: {u.delivered}</p>}

                    <div className="mt-4 flex flex-wrap gap-2">
                        {Array.isArray(u.photos)
                            ? u.photos.map((src, i) => (
                                // eslint-disable-next-line @next/next/no-img-element
                                <img key={i} src={src} alt={`Site photo ${i + 1}`} className="h-20 w-20 rounded-xl object-cover" />
                            ))
                            : Array.from({ length: u.photos || 0 }).map((_, i) => <Thumb key={i} icon="📷" className="h-16 w-16" />)}
                    </div>
                </li>
            ))}
        </ul>
    );
}