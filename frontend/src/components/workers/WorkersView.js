"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { getWorkers } from "@/services/workerService";
import PageHeader from "@/components/ui/PageHeader";
import { card } from "@/lib/styles";

export default function WorkersView() {
    const [workers, setWorkers] = useState(null);
    const [query, setQuery] = useState("");

    useEffect(() => {
        getWorkers().then(setWorkers);
    }, []);

    const q = query.trim().toLowerCase();
    const filtered = (workers ?? []).filter((w) => `${w.name} ${w.phone}`.toLowerCase().includes(q));

    return (
        <div className="space-y-6">
            <Link href="/contractor/dashboard" className="text-sm font-medium hover:text-orange-500">
                ← Back to Dashboard
            </Link>

            <PageHeader title="Workers" subtitle={workers ? `${workers.length} workers` : "Loading..."} />

            <input
                type="search"
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                placeholder="Search by name or phone"
                className="w-full max-w-md rounded-lg border border-white/15 bg-white/5 px-4 py-3 text-sm text-white placeholder-white/50 outline-none focus:border-orange-500 light:border-slate-300 light:bg-white light:text-slate-900 light:placeholder-slate-500"
            />

            <ul className={`divide-y divide-white/10 rounded-2xl light:divide-slate-200 ${card}`}>
                {filtered.map((w) => (
                    <li key={w.id} className="flex items-center justify-between gap-4 px-4 py-3">
                        <div className="flex min-w-0 items-center gap-3">
                            <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-orange-500 text-sm font-bold text-white">
                                {w.name.charAt(0)}
                            </div>
                            <p className="truncate font-semibold">{w.name}</p>
                        </div>
                        <a href={`tel:${w.phone.replace(/\s/g, "")}`} className="text-sm font-medium hover:text-orange-500">
                            {w.phone}
                        </a>
                    </li>
                ))}
                {workers && filtered.length === 0 && <li className="px-4 py-6 text-center text-sm">No workers found.</li>}
            </ul>
        </div>
    );
}