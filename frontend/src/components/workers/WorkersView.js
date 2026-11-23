
"use client";

import { useState } from "react";
import Link from "next/link";
import { useQueryClient } from "@tanstack/react-query";
import { useWorkers } from "@/hooks/queries";
import { addWorker } from "@/services/workerService";
import DataState from "@/components/ui/DataState";
import PageHeader from "@/components/ui/PageHeader";
import FormDialog from "@/components/ui/FormDialog";
import { card, inputClass } from "@/lib/styles";

export default function WorkersView() {
    const qc = useQueryClient();
    const [adding, setAdding] = useState(false);
    const [query, setQuery] = useState("");
    const q = query.trim().toLowerCase();

    return (
        <div className="space-y-6">
            <Link href="/contractor/dashboard" className="text-sm font-medium hover:text-orange-500">← Back to Dashboard</Link>
            <DataState query={useWorkers()}>
                {(workers) => {
                    const shown = workers.filter((w) => `${w.name} ${w.phone}`.toLowerCase().includes(q));
                    return (
                        <>
                            <PageHeader
                                title="Workers"
                                subtitle={`${workers.length} worker${workers.length === 1 ? "" : "s"}`}
                                action={
                                    <button type="button" onClick={() => setAdding(true)} className="rounded-lg bg-orange-500 px-4 py-2.5 text-sm font-semibold text-white hover:bg-orange-600">
                                        + Add Worker
                                    </button>
                                }
                            />
                            <input type="search" value={query} onChange={(e) => setQuery(e.target.value)} placeholder="Search by name or phone" className={`max-w-md ${inputClass}`} />
                            <ul className={`divide-y divide-white/10 rounded-2xl light:divide-slate-200 ${card}`}>
                                {shown.map((w) => (
                                    <li key={w.id} className="flex items-center justify-between gap-4 px-4 py-3">
                                        <div className="flex min-w-0 items-center gap-3">
                                            <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-orange-500 text-sm font-bold text-white">{w.name.charAt(0)}</div>
                                            <p className="truncate font-semibold">{w.name}</p>
                                        </div>
                                        <a href={`tel:${w.phone.replace(/\s/g, "")}`} className="text-sm font-medium hover:text-orange-500">{w.phone}</a>
                                    </li>
                                ))}
                                {shown.length === 0 && <li className="px-4 py-6 text-center text-sm">No workers found.</li>}
                            </ul>
                        </>
                    );
                }}
            </DataState>

            {adding && (
                <FormDialog
                    title="Add new worker"
                    submitLabel="Add Worker"
                    onClose={() => setAdding(false)}
                    fields={[
                        { name: "name", label: "Worker name", placeholder: "Full name", required: true },
                        { name: "phone", label: "Phone", type: "tel", placeholder: "10 digit number", required: true },
                    ]}
                    validate={(f) => (f.phone.replace(/\D/g, "").length < 10 ? "Please enter a 10-digit phone number." : "")}
                    onSubmit={async (f) => {
                        await addWorker(f);
                        await qc.invalidateQueries({ queryKey: ["workers"] });
                    }}
                />
            )}
        </div>
    );
}
