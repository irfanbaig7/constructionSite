"use client";

import { useState } from "react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { useAttendancePage } from "@/hooks/queries";
import { setSiteWorkers } from "@/services/attendanceService";
import DataState from "@/components/ui/DataState";
import PageHeader from "@/components/ui/PageHeader";
import BackLink from "@/components/ui/BackLink";
import { card, inputClass } from "@/lib/styles";

function Body({ data: { sites, workers, map } }) {
    const qc = useQueryClient();
    const [openId, setOpenId] = useState(null);
    const [query, setQuery] = useState("");
    const save = useMutation({
        mutationFn: ({ siteId, ids }) => setSiteWorkers(siteId, ids),
        onSuccess: (next) => qc.setQueryData(["attendance"], (old) => ({ ...old, map: next })),
    });

    const byId = Object.fromEntries(workers.map((w) => [w.id, w]));
    const assigned = new Set(Object.values(map).flat());
    const present = sites.reduce((t, s) => t + (map[s.id]?.length ?? 0), 0);
    const q = query.trim().toLowerCase();
    const free = workers.filter((w) => !assigned.has(w.id) && w.name.toLowerCase().includes(q));
    const set = (siteId, ids) => save.mutate({ siteId, ids });

    return (
        <>
            <PageHeader title="Today's Attendance" subtitle={`${present} of ${workers.length} workers on site • ${workers.length - present} not assigned`} />
            {sites.map((s) => {
                const ids = map[s.id] ?? [];
                const open = openId === s.id;
                return (
                    <section key={s.id} className={`rounded-2xl p-5 ${card}`}>
                        <div className="flex flex-wrap items-center justify-between gap-3">
                            <div>
                                <h2 className="text-lg font-bold">{s.name}</h2>
                                <p className="text-sm">{s.location} • {ids.length} workers</p>
                            </div>
                            <button type="button" onClick={() => { setOpenId(open ? null : s.id); setQuery(""); }}
                                className="rounded-lg bg-orange-500 px-4 py-2 text-sm font-semibold text-white hover:bg-orange-600">
                                {open ? "Done" : "+ Add workers"}
                            </button>
                        </div>

                        {ids.length === 0 ? (
                            <p className="mt-4 text-sm">No workers assigned yet.</p>
                        ) : (
                            <ul className="mt-4 flex flex-wrap gap-2">
                                {ids.map((id) => (
                                    <li key={id} className="flex items-center gap-2 rounded-full border border-white/15 py-1 pl-3 pr-1 text-sm light:border-slate-300">
                                        {byId[id]?.name}
                                        <button type="button" aria-label={`Remove ${byId[id]?.name}`} onClick={() => set(s.id, ids.filter((x) => x !== id))}
                                            className="flex h-6 w-6 items-center justify-center rounded-full text-xs hover:bg-red-500/20 hover:text-red-500">✕</button>
                                    </li>
                                ))}
                            </ul>
                        )}

                        {open && (
                            <div className="mt-4 rounded-xl border border-white/10 p-3 light:border-slate-200">
                                <input type="search" value={query} onChange={(e) => setQuery(e.target.value)} placeholder="Search available workers" className={`mb-3 ${inputClass}`} />
                                <ul className="grid max-h-64 gap-1 overflow-y-auto sm:grid-cols-2">
                                    {free.map((w) => (
                                        <li key={w.id}>
                                            <button type="button" onClick={() => set(s.id, [...ids, w.id])}
                                                className="w-full rounded-lg px-3 py-2 text-left text-sm hover:bg-orange-500/10 hover:text-orange-500">+ {w.name}</button>
                                        </li>
                                    ))}
                                    {free.length === 0 && <li className="px-3 py-2 text-sm">No free workers.</li>}
                                </ul>
                            </div>
                        )}
                    </section>
                );
            })}
        </>
    );
}

export default function AttendanceView() {
    return (
        <div className="space-y-6">
            <BackLink />
            <DataState query={useAttendancePage()}>{(data) => <Body data={data} />}</DataState>
        </div>
    );
}