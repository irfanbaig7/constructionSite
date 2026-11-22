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

const icon = (name) => ledgerCategories.find((c) => c.name === name)?.icon ?? "📌";

export default function ExpensesView({ id }) {
    const [data, setData] = useState(undefined);
    const [entries, setEntries] = useState([]);
    const [adding, setAdding] = useState(false);
    const [error, setError] = useState("");

    const load = useCallback(async () => {
        const [d, e] = await Promise.all([getOwnerProjectDetails(id), getEntries(id)]);
        setData(d);
        setEntries(e);
    }, [id]);

    useEffect(() => {
        load().catch(() => setData(null));
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

    async function remove(entryId) {
        setError("");
        try {
            await deleteEntry(id, entryId);
            load();
        } catch (e) {
            setError(e.message);
        }
    }

    return (
        <div className="space-y-8">
            {back}
            <PageHeader
                title="Kharcha ka hisaab"
                subtitle={`${project.name} • Kul: ${formatINRFull(sumAmount(payments) + sumAmount(entries))}`}
            />

            <section className="space-y-3">
                <div className="flex flex-wrap items-end justify-between gap-2">
                    <h2 className="text-lg font-bold">Contractor ko diye payments</h2>
                    <p className="font-bold">{formatINRFull(sumAmount(payments))}</p>
                </div>
                {payments.length === 0 ? (
                    <EmptyState text="Abhi koi payment record nahi hua." />
                ) : (
                    <ul className={`divide-y divide-white/10 rounded-2xl light:divide-slate-200 ${card}`}>
                        {payments.map((p) => (
                            <li key={p.id} className="flex items-center justify-between gap-3 px-4 py-3">
                                <div>
                                    <p className="font-semibold">{p.label}</p>
                                    <p className="text-xs">{formatDate(p.date)}</p>
                                </div>
                                <p className="font-bold">{formatINRFull(p.amount)}</p>
                            </li>
                        ))}
                    </ul>
                )}
            </section>

            <section className="space-y-3">
                <div className="flex flex-wrap items-end justify-between gap-2">
                    <div>
                        <h2 className="text-lg font-bold">Meri notebook (material aur baaki kharche)</h2>
                        <p className="text-xs">Material jo aapne laaye ya payment se mangwaye, wo yahan apne aap judte hain. Ye sirf aapko dikhta hai.</p>
                    </div>
                    <PrimaryButton onClick={() => setAdding(true)}>+ Add Expense</PrimaryButton>
                </div>
                {error && <p className="text-sm text-red-500">{error}</p>}
                {entries.length === 0 ? (
                    <EmptyState text="Apne kharche yahan likho." />
                ) : (
                    <ul className={`divide-y divide-white/10 rounded-2xl light:divide-slate-200 ${card}`}>
                        {entries.map((r) => (
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
                                    {!r.auto && (
                                        <button type="button" aria-label="Delete entry" onClick={() => remove(r.id)}
                                            className="flex h-7 w-7 items-center justify-center rounded-full text-xs hover:bg-red-500/20 hover:text-red-500">✕</button>
                                    )}
                                </div>
                            </li>
                        ))}
                    </ul>
                )}
            </section>

            {adding && (
                <FormDialog
                    title="Add expense"
                    submitLabel="Add"
                    onClose={() => setAdding(false)}
                    fields={[
                        { name: "title", label: "Kis cheez ka kharcha", placeholder: "e.g. Tiles", required: true, span: true },
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