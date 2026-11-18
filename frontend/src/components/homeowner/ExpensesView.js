"use client";

import { useCallback, useEffect, useState } from "react";
import { getOwnerProjectDetails } from "@/services/projectService";
import { getEntries, addEntry, deleteEntry } from "@/services/ledgerService";
import { ledgerCategories } from "@/config/ledgerCategories";
import BackLink from "@/components/ui/BackLink";
import PageHeader from "@/components/ui/PageHeader";
import PrimaryButton from "@/components/ui/PrimaryButton";
import EmptyState from "@/components/ui/EmptyState";
import FormDialog from "@/components/ui/FormDialog";
import { card } from "@/lib/styles";
import { formatINRFull, sumAmount } from "@/lib/money";
import { formatDate, todayKey } from "@/lib/date";

const icon = (name) =>
    name === "Contractor" ? "💵" : ledgerCategories.find((c) => c.name === name)?.icon ?? "📌";

export default function ExpensesView({ id }) {
    const [data, setData] = useState(undefined);
    const [entries, setEntries] = useState([]);
    const [filter, setFilter] = useState("All");
    const [adding, setAdding] = useState(false);

    const load = useCallback(async () => {
        const [d, e] = await Promise.all([getOwnerProjectDetails(id), getEntries(id)]);
        setData(d);
        setEntries(e);
    }, [id]);

    useEffect(() => {
        load();
    }, [load]);

    const back = <BackLink href="/homeowner/dashboard">← Back to Project</BackLink>;
    if (data === undefined) return <p>Loading...</p>;
    if (data === null) {
        return (
            <div className="space-y-4">
                {back}
                <p>Project not found.</p>
            </div>
        );
    }

    const { project, payments } = data;
    const rows = [
        ...payments.map((p) => ({ id: p.id, category: "Contractor", title: `Contractor ko diya: ${p.label}`, date: p.date, amount: p.amount, own: false })),
        ...entries.map((e) => ({ ...e, own: true })),
    ].sort((a, b) => b.date.localeCompare(a.date));

    const total = sumAmount(rows);
    const groups = [
        ["Contractor", sumAmount(payments)],
        ...ledgerCategories.map((c) => [c.name, sumAmount(entries.filter((e) => e.category === c.name))]),
    ].filter(([, v]) => v > 0);
    const list = filter === "All" ? rows : rows.filter((r) => r.category === filter);

    async function remove(rowId) {
        await deleteEntry(id, rowId);
        load();
    }

    return (
        <div className="space-y-6">
            {back}
            <PageHeader
                title="Kharcha ka hisaab"
                subtitle={`${project.name} • Total: ${formatINRFull(total)}`}
                action={<PrimaryButton onClick={() => setAdding(true)}>+ Add Expense</PrimaryButton>}
            />

            {/* Where did the money go */}
            <section className={`rounded-2xl p-5 ${card}`}>
                <h2 className="text-lg font-bold">Paisa kahan gaya</h2>
                {groups.length === 0 ? (
                    <p className="mt-3 text-sm">Abhi koi kharcha nahi hai.</p>
                ) : (
                    <div className="mt-4 space-y-4">
                        {groups.map(([name, value]) => (
                            <div key={name}>
                                <div className="flex justify-between text-sm">
                                    <span>{icon(name)} {name}</span>
                                    <span className="font-semibold">{formatINRFull(value)}</span>
                                </div>
                                <div className="mt-1 h-3 rounded-full bg-white/15 light:bg-slate-200">
                                    <div className="h-3 rounded-full bg-orange-500" style={{ width: `${Math.round((value / total) * 100)}%` }} />
                                </div>
                            </div>
                        ))}
                    </div>
                )}
            </section>

            {/* Notebook list */}
            <div className="flex flex-wrap gap-2">
                {["All", "Contractor", ...ledgerCategories.map((c) => c.name)].map((name) => (
                    <button
                        key={name}
                        type="button"
                        onClick={() => setFilter(name)}
                        className={`rounded-full border px-3 py-1.5 text-xs font-semibold transition ${filter === name
                            ? "border-orange-500 bg-orange-500/10 text-orange-500"
                            : "border-white/15 hover:border-orange-500 light:border-slate-300"}`}
                    >
                        {name}
                    </button>
                ))}
            </div>

            {list.length === 0 ? (
                <EmptyState text="Is category me koi entry nahi." />
            ) : (
                <ul className={`divide-y divide-white/10 rounded-2xl light:divide-slate-200 ${card}`}>
                    {list.map((r) => (
                        <li key={r.id} className="flex items-center justify-between gap-3 px-4 py-3">
                            <div className="flex min-w-0 items-center gap-3">
                                <span className="text-2xl">{icon(r.category)}</span>
                                <div className="min-w-0">
                                    <p className="truncate font-semibold">{r.title}</p>
                                    <p className="text-xs">{r.category} • {formatDate(r.date)}</p>
                                </div>
                            </div>
                            <div className="flex items-center gap-3">
                                <p className="whitespace-nowrap font-bold">{formatINRFull(r.amount)}</p>
                                {r.own && (
                                    <button type="button" aria-label="Delete entry" onClick={() => remove(r.id)}
                                        className="flex h-7 w-7 items-center justify-center rounded-full text-xs hover:bg-red-500/20 hover:text-red-500">
                                        ✕
                                    </button>
                                )}
                            </div>
                        </li>
                    ))}
                </ul>
            )}

            {adding && (
                <FormDialog
                    title="Add expense"
                    submitLabel="Add"
                    onClose={() => setAdding(false)}
                    fields={[
                        { name: "title", label: "Kis cheez ka kharcha", placeholder: "e.g. Cement 50 bags", required: true, span: true },
                        { name: "category", label: "Category", options: ledgerCategories.map((c) => c.name), defaultValue: ledgerCategories[0].name },
                        { name: "amount", label: "Amount (₹)", type: "number", min: "1", required: true },
                        { name: "date", label: "Date", type: "date", required: true, defaultValue: todayKey() },
                    ]}
                    onSubmit={async (f) => {
                        await addEntry(id, f);
                        await load();
                    }}
                />
            )}
        </div>
    );
}