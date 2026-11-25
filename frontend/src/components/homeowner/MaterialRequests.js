
"use client";

import { useState } from "react";
import FormDialog from "@/components/ui/FormDialog";
import useSession from "@/hooks/useSession";
import { card } from "@/lib/styles";
import { formatINRFull } from "@/lib/money";
import { openCheckout } from "@/lib/razorpay";
import { respondRequest, deliverRequest, createPayOrder, verifyPay } from "@/services/materialService";

const OPEN = ["pending", "owner_bringing", "quote_needed", "awaiting_payment", "paid_awaiting_delivery"];
const btn = "rounded-lg px-3 py-2 text-sm font-semibold";

export default function MaterialRequests({ projectId, requests, onChanged }) {
    const session = useSession();
    const [dialog, setDialog] = useState(null); // request being delivered
    const [busyId, setBusyId] = useState(null);
    const [error, setError] = useState("");

    const open = requests.filter((r) => OPEN.includes(r.status));
    if (open.length === 0) return null;

    async function run(id, fn) {
        setError("");
        setBusyId(id);
        try {
            await fn();
            onChanged();
        } catch (e) {
            setError(e.message);
        } finally {
            setBusyId(null);
        }
    }

    const pay = (r) =>
        run(r.id, async () => {
            const o = await createPayOrder(projectId, r.id);
            const res = await openCheckout({
                key: o.keyId,
                amount: o.amount,
                currency: o.currency,
                order_id: o.orderId,
                name: "SiteProof",
                description: `${r.name} ${r.quantity} ${r.unit}`,
                prefill: { email: session?.email },
                theme: { color: "#f97316" },
            });
            await verifyPay(projectId, r.id, res);
        });

    return (
        <section className={`rounded-2xl border-orange-500/60 p-5 ${card}`}>
            <h2 className="text-lg font-bold">🔔 Material Requests from Contractor</h2>
            {error && <p className="mt-2 text-sm text-red-500">{error}</p>}
            <ul className="mt-3 divide-y divide-white/10 light:divide-slate-200">
                {open.map((r) => (
                    <li key={r.id} className="space-y-2 py-3">
                        <p className="font-semibold">{r.name}: {r.quantity} {r.unit}</p>
                        {r.note && <p className="text-sm">{r.note}</p>}

                        {r.status === "pending" && (
                            <div className="flex flex-wrap gap-2">
                                <button type="button" disabled={busyId === r.id} className={`${btn} bg-orange-500 text-white hover:bg-orange-600`}
                                    onClick={() => run(r.id, () => respondRequest(projectId, r.id, "will_bring"))}>
                                    I’ll Arrange It
                                </button>
                                <button type="button" disabled={busyId === r.id} className={`${btn} border border-white/15 hover:border-orange-500 light:border-slate-300`}
                                    onClick={() => run(r.id, () => respondRequest(projectId, r.id, "ask_contractor"))}>
                                    Ask Contractor to Arrange
                                </button>
                            </div>
                        )}

                        {r.status === "owner_bringing" && (
                            <div className="flex flex-wrap items-center gap-2">
                                <span className="text-sm">You’re arranging this material.</span>
                                <button type="button" className={`${btn} bg-orange-500 text-white hover:bg-orange-600`} onClick={() => setDialog(r)}>
                                    Mark as Delivered
                                </button>
                                <button type="button" disabled={busyId === r.id} className={`${btn} border border-white/15 hover:border-orange-500 light:border-slate-300`}
                                    onClick={() => run(r.id, () => respondRequest(projectId, r.id, "ask_contractor"))}>
                                    Unable to Arrange — Ask Contractor
                                </button>
                            </div>
                        )}

                        {r.status === "quote_needed" && <p className="text-sm">Waiting for the contractor’s price quote.</p>}
                        {r.status === "paid_awaiting_delivery" && <p className="text-sm">Test payment confirmed. Waiting for the contractor to confirm delivery.</p>}

                        {r.status === "awaiting_payment" && (
                            <div className="flex flex-wrap items-center gap-3">
                                <p className="text-sm">Contractor’s Quote: <span className="font-bold">{formatINRFull(r.amount)}</span> ({r.quantity} {r.unit})</p>
                                <button type="button" disabled={busyId === r.id} className={`${btn} bg-orange-500 text-white hover:bg-orange-600 disabled:opacity-60`}
                                    onClick={() => pay(r)}>
                                    {busyId === r.id ? "Please wait..." : `Test payment · ${formatINRFull(r.amount)}`}
                                </button>
                            </div>
                        )}
                    </li>
                ))}
            </ul>

            {dialog && (
                <FormDialog
                    title={`Confirm ${dialog.name} Delivery`}
                    submitLabel="Confirm Delivery"
                    onClose={() => setDialog(null)}
                    initial={{ quantity: dialog.quantity }}
                    fields={[
                        { name: "quantity", label: `Quantity Delivered (${dialog.unit})`, type: "number", min: "0.01", step: "any", required: true },
                        { name: "amount", label: "Amount Spent (₹, visible only to you)", type: "number", min: "0", step: "any" },
                    ]}
                    onSubmit={async (f) => {
                        await deliverRequest(projectId, dialog.id, { quantity: Number(f.quantity), amount: Number(f.amount || 0) });
                        onChanged();
                    }}
                />
            )}
        </section>
    );
}
