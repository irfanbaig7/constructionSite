
"use client";

import { useState } from "react";
import StatCard from "@/components/dashboard/StatCard";
import EmptyState from "@/components/ui/EmptyState";
import PrimaryButton from "@/components/ui/PrimaryButton";
import ProgressBar from "@/components/ui/ProgressBar";
import { card } from "@/lib/styles";
import { formatINR } from "@/lib/format";
import { formatDate } from "@/lib/date";
import { formatINRFull, sumAmount } from "@/lib/money";
import { deleteWorkerPayment } from "@/services/projectService";
import { cancelPaymentRequest } from "@/services/paymentService";

export default function PaymentsTab({ project, payments, paymentRequests, workerPayments, onAdd, onAddWorker, onChanged }) {
    const [error, setError] = useState("");
    const received = sumAmount(payments);
    const pending = project.budget - received;
    const percent = Math.round((received / project.budget) * 100);

    // total paid per worker
    const perWorker = Object.entries(
        workerPayments.reduce((acc, p) => ({ ...acc, [p.workerName]: (acc[p.workerName] ?? 0) + p.amount }), {})
    );

    async function remove(id) {
        if (!window.confirm("Are you sure you want to delete this payment?")) return;
        setError("");
        try {
            await deleteWorkerPayment(project.id, id);
            onChanged();
        } catch (e) {
            setError(e.message);
        }
    }

    const openRequests = paymentRequests.filter((r) => r.status === "pending");

    async function cancel(id) {
        if (!window.confirm("Are you sure you want to cancel this request?")) return;
        setError("");
        try {
            await cancelPaymentRequest(project.id, id);
            onChanged();
        } catch (e) {
            setError(e.message);
        }
    }

    return (
        <div className="space-y-8">
            <section className="space-y-6">
                <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
                    <StatCard label="Project Budget" value={formatINR(project.budget)} icon="💼" tone="purple" />
                    <StatCard label="Received" value={formatINR(received)} icon="💵" tone="green" />
                    <StatCard label="Pending" value={formatINR(pending)} icon="⏳" tone="orange" />
                </div>

                <div className={`rounded-2xl p-5 ${card}`}>
                    <p className="mb-2 text-sm font-medium">{percent}% of the budget received</p>
                    <ProgressBar value={percent} />
                </div>

                <div className="flex items-center justify-between">
                    <h2 className="text-lg font-bold">Payments from {project.owner}</h2>
                    <PrimaryButton onClick={onAdd}>+ Request Payment</PrimaryButton>
                </div>

                {error && <p className="text-sm text-red-500">{error}</p>}
                {openRequests.length > 0 && (
                    <ul className={`divide-y divide-white/10 rounded-2xl border-orange-500/60 light:divide-slate-200 ${card}`}>
                        {openRequests.map((r) => (
                            <li key={r.id} className="flex items-center justify-between gap-3 px-4 py-3">
                                <div>
                                    <p className="font-semibold">{r.label}: {formatINRFull(r.amount)}</p>
                                    <p className="text-xs">Awaiting homeowner payment{r.note && ` • ${r.note}`}</p>
                                </div>
                                <button type="button" onClick={() => cancel(r.id)}
                                    className="rounded-md border border-white/15 px-2.5 py-1 text-xs font-medium hover:border-red-500 hover:text-red-500 light:border-slate-300">
                                    Cancel
                                </button>
                            </li>
                        ))}
                    </ul>
                )}

                {payments.length === 0 ? (
                    <EmptyState text="No payments recorded yet." />
                ) : (
                    <ul className={`divide-y divide-white/10 rounded-2xl light:divide-slate-200 ${card}`}>
                        {payments.map((p) => (
                            <li key={p.id} className="flex items-center justify-between gap-4 px-4 py-3">
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

            <section className="space-y-4">
                <div className="flex flex-wrap items-center justify-between gap-3">
                    <div>
                        <h2 className="text-lg font-bold">Payments Made to Workers</h2>
                        <p className="text-sm">Total: <span className="font-semibold">{formatINRFull(sumAmount(workerPayments))}</span> (Visible only to you)</p>
                    </div>
                    <PrimaryButton onClick={onAddWorker}>+ Worker Payment</PrimaryButton>
                </div>
                {error && <p className="text-sm text-red-500">{error}</p>}

                {perWorker.length > 0 && (
                    <div className="flex flex-wrap gap-2">
                        {perWorker.map(([name, total]) => (
                            <span key={name} className="rounded-full bg-orange-500/10 px-3 py-1 text-xs font-medium text-orange-500">
                                {name}: {formatINRFull(total)}
                            </span>
                        ))}
                    </div>
                )}

                {workerPayments.length === 0 ? (
                    <EmptyState text="No worker payments have been recorded yet." />
                ) : (
                    <ul className={`divide-y divide-white/10 rounded-2xl light:divide-slate-200 ${card}`}>
                        {workerPayments.map((p) => (
                            <li key={p.id} className="flex items-center justify-between gap-4 px-4 py-3">
                                <div className="min-w-0">
                                    <p className="truncate font-semibold">{p.workerName}</p>
                                    <p className="text-xs">{formatDate(p.date)}{p.note && ` • ${p.note}`}</p>
                                </div>
                                <div className="flex items-center gap-3">
                                    <p className="font-bold">{formatINRFull(p.amount)}</p>
                                    <button type="button" aria-label="Delete" onClick={() => remove(p.id)}
                                        className="flex h-7 w-7 items-center justify-center rounded-full text-xs hover:bg-red-500/20 hover:text-red-500">✕</button>
                                </div>
                            </li>
                        ))}
                    </ul>
                )}
            </section>
        </div>
    );
}
