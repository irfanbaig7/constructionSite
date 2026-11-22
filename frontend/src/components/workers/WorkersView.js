"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { getWorkers, addWorker } from "@/services/workerService";
import PageHeader from "@/components/ui/PageHeader";
import Field from "@/components/ui/Field";
import { card, inputClass } from "@/lib/styles";

export default function WorkersView() {
    const [workers, setWorkers] = useState(null);
    const [query, setQuery] = useState("");
    const [showForm, setShowForm] = useState(false);
    const [form, setForm] = useState({ name: "", phone: "" });
    const [error, setError] = useState("");

    useEffect(() => {
        getWorkers().then(setWorkers);
    }, []);

    const update = (e) => setForm({ ...form, [e.target.name]: e.target.value });

    function closeForm() {
        setShowForm(false);
        setForm({ name: "", phone: "" });
        setError("");
    }

    async function handleSubmit(e) {
        e.preventDefault();
        setError("");
        if (!/^\d{10}$/.test(form.phone.replace(/\s/g, ""))) return setError("Enter a 10 digit phone number.");
        const worker = await addWorker(form);
        setWorkers((prev) => [...prev, worker]);
        closeForm();
    }

    const q = query.trim().toLowerCase();
    const filtered = (workers ?? []).filter((w) => `${w.name} ${w.phone}`.toLowerCase().includes(q));

    return (
        <div className="space-y-6">
            <Link href="/contractor/dashboard" className="text-sm font-medium hover:text-orange-500">
                ← Back to Dashboard
            </Link>

            <PageHeader
                title="Workers"
                subtitle={workers ? `${workers.length} worker${workers.length === 1 ? "" : "s"}` : "Loading..."}
                action={
                    !showForm && (
                        <button
                            type="button"
                            onClick={() => setShowForm(true)}
                            className="rounded-lg bg-orange-500 px-4 py-2.5 text-sm font-semibold text-white hover:bg-orange-600"
                        >
                            + Add Worker
                        </button>
                    )
                }
            />

            {showForm && (
                <form onSubmit={handleSubmit} className={`space-y-4 rounded-2xl p-5 ${card}`}>
                    <h2 className="text-lg font-bold">Add new worker</h2>
                    {error && (
                        <p className="rounded-lg border border-red-500/40 bg-red-500/10 px-3 py-2 text-sm text-red-500">{error}</p>
                    )}
                    <div className="grid gap-4 sm:grid-cols-2">
                        <Field label="Worker name" name="name" value={form.name} onChange={update} placeholder="Full name" required />
                        <Field label="Phone" name="phone" type="tel" value={form.phone} onChange={update} placeholder="10 digit number" required />
                    </div>
                    <div className="flex gap-3">
                        <button type="submit" className="rounded-lg bg-orange-500 px-4 py-2.5 text-sm font-semibold text-white hover:bg-orange-600">
                            Add Worker
                        </button>
                        <button
                            type="button"
                            onClick={closeForm}
                            className="rounded-lg border border-white/15 px-4 py-2.5 text-sm font-semibold hover:border-orange-500 light:border-slate-300"
                        >
                            Cancel
                        </button>
                    </div>
                </form>
            )}

            <input
                type="search"
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                placeholder="Search by name or phone"
                className={`max-w-md ${inputClass}`}
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