"use client";

import { useEffect, useState } from "react";
import { getProjects } from "@/services/projectService";
import { getWorkers } from "@/services/workerService";
import { getTodayAttendance, setSiteWorkers } from "@/services/attendanceService";
import PageHeader from "@/components/ui/PageHeader";
import BackLink from "@/components/ui/BackLink";
import { card } from "@/lib/styles";

export default function AttendanceView() {
    const [sites, setSites] = useState(null);
    const [workers, setWorkers] = useState([]);
    const [attendance, setAttendance] = useState({});
    const [openId, setOpenId] = useState(null); // site whose picker is open
    const [query, setQuery] = useState("");

    useEffect(() => {
        Promise.all([getProjects(), getWorkers(), getTodayAttendance()]).then(([p, w, a]) => {
            setSites(p.filter((x) => x.status === "in_progress"));
            setWorkers(w);
            setAttendance(a);
        });
    }, []);

    if (!sites) return <p>Loading...</p>;

    const byId = Object.fromEntries(workers.map((w) => [w.id, w]));
    const siteOf = {}; // workerId -> site name
    sites.forEach((s) => (attendance[s.id] ?? []).forEach((id) => (siteOf[id] = s.name)));
    const present = Object.keys(siteOf).length;

    async function update(siteId, ids) {
        setAttendance(await setSiteWorkers(siteId, ids));
    }
    const add = (siteId, wid) => update(siteId, [...(attendance[siteId] ?? []), wid]);
    const remove = (siteId, wid) => update(siteId, (attendance[siteId] ?? []).filter((id) => id !== wid));

    const q = query.trim().toLowerCase();
    const available = workers.filter((w) => !siteOf[w.id] && w.name.toLowerCase().includes(q));

    return (
        <div className="space-y-6">
            <BackLink />
            <PageHeader
                title="Today's Attendance"
                subtitle={`${present} of ${workers.length} workers on site • ${workers.length - present} not assigned`}
            />

            {sites.map((s) => {
                const ids = attendance[s.id] ?? [];
                const open = openId === s.id;
                return (
                    <section key={s.id} className={`rounded-2xl p-5 ${card}`}>
                        <div className="flex flex-wrap items-center justify-between gap-3">
                            <div>
                                <h2 className="text-lg font-bold">{s.name}</h2>
                                <p className="text-sm">{s.location} • {ids.length} workers</p>
                            </div>
                            <button
                                type="button"
                                onClick={() => { setOpenId(open ? null : s.id); setQuery(""); }}
                                className="rounded-lg bg-orange-500 px-4 py-2 text-sm font-semibold text-white hover:bg-orange-600"
                            >
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
                                        <button
                                            type="button"
                                            aria-label={`Remove ${byId[id]?.name}`}
                                            onClick={() => remove(s.id, id)}
                                            className="flex h-6 w-6 items-center justify-center rounded-full text-xs hover:bg-red-500/20 hover:text-red-500"
                                        >
                                            ✕
                                        </button>
                                    </li>
                                ))}
                            </ul>
                        )}

                        {open && (
                            <div className="mt-4 rounded-xl border border-white/10 p-3 light:border-slate-200">
                                <input
                                    type="search"
                                    value={query}
                                    onChange={(e) => setQuery(e.target.value)}
                                    placeholder="Search available workers"
                                    className="mb-3 w-full rounded-lg border border-white/15 bg-white/5 px-3 py-2 text-sm outline-none focus:border-orange-500 light:border-slate-300 light:bg-white"
                                />
                                <ul className="grid max-h-64 gap-1 overflow-y-auto sm:grid-cols-2">
                                    {available.map((w) => (
                                        <li key={w.id}>
                                            <button
                                                type="button"
                                                onClick={() => add(s.id, w.id)}
                                                className="w-full rounded-lg px-3 py-2 text-left text-sm hover:bg-orange-500/10 hover:text-orange-500"
                                            >
                                                + {w.name}
                                            </button>
                                        </li>
                                    ))}
                                    {available.length === 0 && <li className="px-3 py-2 text-sm">No free workers.</li>}
                                </ul>
                            </div>
                        )}
                    </section>
                );
            })}
        </div>
    );
}