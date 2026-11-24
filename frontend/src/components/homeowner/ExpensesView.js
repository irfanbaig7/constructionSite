
"use client";

import { useState } from "react";
import { useQueryClient } from "@tanstack/react-query";
import { useOwnerLedger } from "@/hooks/queries";
import { addEntry } from "@/services/ledgerService";
import { ledgerCategories } from "@/config/ledgerCategories";
import DataState from "@/components/ui/DataState";
import BackLink from "@/components/ui/BackLink";
import PageHeader from "@/components/ui/PageHeader";
import PrimaryButton from "@/components/ui/PrimaryButton";
import EmptyState from "@/components/ui/EmptyState";
import FormDialog from "@/components/ui/FormDialog";
import { card } from "@/lib/styles";
import { formatINRFull, sumAmount } from "@/lib/money";
import { formatDate, todayKey } from "@/lib/date";

const icon = (name) => ledgerCategories.find((c) => c.name === name)?.icon ?? "📌";
const Row = ({ title, sub, amount }) => (
    <li className="flex items-center justify-between gap-3 px-4 py-3">
        <div className="min-w-0">
            <p className="truncate font-semibold">{title}</p>
            <p className="text-xs">{sub}</p>
        </div>
        <div className="flex items-center gap-3">
            <p className="whitespace-nowrap font-bold">{formatINRFull(amount)}</p>
        </div>
    </li>
);

export default function ExpensesView({ id }) {
    const qc = useQueryClient();
    const [adding, setAdding] = useState(false);
    const refresh = () => qc.invalidateQueries();

    return (
        <div className="space-y-8">
            <BackLink href="/homeowner/dashboard">← Back to Project</BackLink>
            <DataState query={useOwnerLedger(id)} notFound="Project not found.">
                {({ project, payments, entries }) => (
                    <>
                        <PageHeader title="Expense Summary" subtitle={`${project.name} • Total: ${formatINRFull(sumAmount(payments) + sumAmount(entries))}`} />

                        <section className="space-y-3">
                            <div className="flex items-end justify-between gap-2">
                                <h2 className="text-lg font-bold">Payments made to the contractor</h2>
                                <p className="font-bold">{formatINRFull(sumAmount(payments))}</p>
                            </div>
                            {payments.length === 0 ? <EmptyState text="No payments have been recorded yet." /> : (
                                <ul className={`divide-y divide-white/10 rounded-2xl light:divide-slate-200 ${card}`}>
                                    {payments.map((p) => <Row key={p.id} title={p.label} sub={formatDate(p.date)} amount={p.amount} />)}
                                </ul>
                            )}
                        </section>

                        <section className="space-y-3">
                            <div className="flex flex-wrap items-end justify-between gap-2">
                                <div>
                                    <h2 className="text-lg font-bold">My Expense Log (Materials and Other Expenses)</h2>
                                    <p className="text-xs">Materials you purchase or order through payments are automatically added here. Only you can see this section.</p>
                                </div>
                                <PrimaryButton onClick={() => setAdding(true)}>+ Add Expense</PrimaryButton>
                            </div>
                            {entries.length === 0 ? <EmptyState text="Record your expenses here." /> : (
                                <ul className={`divide-y divide-white/10 rounded-2xl light:divide-slate-200 ${card}`}>
                                    {entries.map((r) => (
                                        <Row key={r.id} title={`${icon(r.category)} ${r.title}`} sub={`${r.category} • ${formatDate(r.date)}`} amount={r.amount} />
                                    ))}
                                </ul>
                            )}
                        </section>
                    </>
                )}
            </DataState>

            {adding && (
                <FormDialog
                    title="Add expense"
                    submitLabel="Add"
                    onClose={() => setAdding(false)}
                    fields={[
                        { name: "title", label: "Expense Description", placeholder: "e.g. Tiles", required: true, span: true },
                        { name: "category", label: "Category", options: ledgerCategories.map((c) => c.name), defaultValue: ledgerCategories[0].name },
                        { name: "amount", label: "Amount (₹)", type: "number", min: "1", required: true },
                        { name: "date", label: "Date", type: "date", required: true, defaultValue: todayKey() },
                    ]}
                    onSubmit={async (f) => {
                        await addEntry(id, f);
                        await refresh();
                    }}
                />
            )}
        </div>
    );
}
