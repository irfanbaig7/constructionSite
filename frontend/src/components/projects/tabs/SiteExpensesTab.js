
"use client";

import { useState } from "react";
import EmptyState from "@/components/ui/EmptyState";
import PrimaryButton from "@/components/ui/PrimaryButton";
import { card } from "@/lib/styles";
import { formatDate } from "@/lib/date";
import { formatINRFull, sumAmount } from "@/lib/money";
import { expenseCategories } from "@/config/expenseCategories";
import { deleteExpense } from "@/services/projectService";

export default function SiteExpensesTab({ projectId, expenses, onAdd, onChanged }) {
    const [filter, setFilter] = useState("All");
    const [error, setError] = useState("");

    const list = filter === "All" ? expenses : expenses.filter((e) => e.category === filter);
    const icon = (name) => expenseCategories.find((c) => c.name === name)?.icon ?? "📌";

    async function remove(id) {
        if (!window.confirm("Are you sure you want to delete this expense?")) return;
        setError("");
        try {
            await deleteExpense(projectId, id);
            onChanged();
        } catch (e) {
            setError(e.message);
        }
    }

    return (
        <div className="space-y-4">
            <div className="flex flex-wrap items-center justify-between gap-3">
                <div>
                    <p className="text-sm">{filter === "All" ? "My Expenses" : `${filter} Total`}</p>
                    <p className="text-3xl font-bold">{formatINRFull(sumAmount(list))}</p>
                </div>
                <PrimaryButton onClick={onAdd}>+ Add Expense</PrimaryButton>
            </div>

            <p className="text-sm">🔒 These are your personal expenses (tools, transport, refreshments). Only you can see them; they are not visible to the homeowner.</p>
            {error && <p className="text-sm text-red-500">{error}</p>}

            <div className="flex flex-wrap gap-2">
                {["All", ...expenseCategories.map((c) => c.name)].map((name) => (
                    <button key={name} type="button" onClick={() => setFilter(name)}
                        className={`rounded-full border px-3 py-1.5 text-xs font-semibold transition ${filter === name
                            ? "border-orange-500 bg-orange-500/10 text-orange-500"
                            : "border-white/15 hover:border-orange-500 light:border-slate-300"}`}>
                        {name}
                    </button>
                ))}
            </div>

            {list.length === 0 ? (
                <EmptyState text="No expenses recorded yet." />
            ) : (
                <ul className={`divide-y divide-white/10 rounded-2xl light:divide-slate-200 ${card}`}>
                    {list.map((e) => (
                        <li key={e.id} className="flex items-center justify-between gap-4 px-4 py-3">
                            <div className="flex min-w-0 items-center gap-3">
                                <span className="text-2xl">{icon(e.category)}</span>
                                <div className="min-w-0">
                                    <p className="truncate font-semibold">{e.title}</p>
                                    <p className="text-xs">{e.category} • {formatDate(e.date)}</p>
                                </div>
                            </div>
                            <div className="flex items-center gap-3">
                                <p className="whitespace-nowrap font-bold">{formatINRFull(e.amount)}</p>
                                <button type="button" aria-label="Delete" onClick={() => remove(e.id)}
                                    className="flex h-7 w-7 items-center justify-center rounded-full text-xs hover:bg-red-500/20 hover:text-red-500">✕</button>
                            </div>
                        </li>
                    ))}
                </ul>
            )}
        </div>
    );
}
