"use client";

import { useState } from "react";
import EmptyState from "@/components/ui/EmptyState";
import PrimaryButton from "@/components/ui/PrimaryButton";
import { card } from "@/lib/styles";
import { formatDate } from "@/lib/date";
import { formatINRFull, sumAmount } from "@/lib/money";
import { expenseCategories } from "@/config/expenseCategories";

export default function SiteExpensesTab({ expenses }) {
    const [filter, setFilter] = useState("All");

    const list = filter === "All" ? expenses : expenses.filter((e) => e.category === filter);
    const icon = (name) => expenseCategories.find((c) => c.name === name)?.icon ?? "📌";

    return (
        <div className="space-y-4">
            <div className="flex flex-wrap items-center justify-between gap-3">
                <div>
                    <p className="text-sm">{filter === "All" ? "Total Site Expenses" : `${filter} total`}</p>
                    <p className="text-3xl font-bold">{formatINRFull(sumAmount(list))}</p>
                </div>
                <PrimaryButton>+ Add Expense</PrimaryButton>
            </div>

            <p className="text-sm">🔒 Private: only you can see these expenses. The homeowner cannot.</p>

            <div className="flex flex-wrap gap-2">
                {["All", ...expenseCategories.map((c) => c.name)].map((name) => (
                    <button
                        key={name}
                        type="button"
                        onClick={() => setFilter(name)}
                        className={`rounded-full border px-3 py-1.5 text-xs font-semibold transition ${filter === name
                                ? "border-orange-500 bg-orange-500/10 text-orange-500"
                                : "border-white/15 hover:border-orange-500 light:border-slate-300"
                            }`}
                    >
                        {name}
                    </button>
                ))}
            </div>

            {list.length === 0 ? (
                <EmptyState text="No expenses in this category." />
            ) : (
                <ul className={`divide-y divide-white/10 rounded-2xl light:divide-slate-200 ${card}`}>
                    {list.map((e) => (
                        <li key={e.id} className="flex items-center justify-between gap-4 px-4 py-3">
                            <div className="flex min-w-0 items-center gap-3">
                                <span className="text-2xl">{icon(e.category)}</span>
                                <div className="min-w-0">
                                    <p className="truncate font-semibold">{e.title}</p>
                                    <p className="text-xs">
                                        {e.category} • {formatDate(e.date)}
                                    </p>
                                </div>
                            </div>
                            <p className="whitespace-nowrap font-bold">{formatINRFull(e.amount)}</p>
                        </li>
                    ))}
                </ul>
            )}
        </div>
    );
}