
"use client";

import { useState } from "react";
import useSession from "@/hooks/useSession";
import { card } from "@/lib/styles";
import { formatINRFull } from "@/lib/money";
import { openCheckout } from "@/lib/razorpay";
import { createPaymentOrder, verifyPayment } from "@/services/paymentService";

const btn = "rounded-lg px-3 py-2 text-sm font-semibold";

export default function PaymentRequests({ projectId, requests, onChanged }) {
    const session = useSession();
    const [busyId, setBusyId] = useState(null);
    const [error, setError] = useState("");

    const open = requests.filter((r) => r.status === "pending");
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
            const o = await createPaymentOrder(projectId, r.id);
            const res = await openCheckout({
                key: o.keyId,
                amount: o.amount,
                currency: o.currency,
                order_id: o.orderId,
                name: "SiteProof",
                description: r.label,
                prefill: { email: session?.email },
                theme: { color: "#f97316" },
            });
            await verifyPayment(projectId, r.id, res);
        });

    return (
        <section className={`rounded-2xl border-orange-500/60 p-5 ${card}`}>
            <h2 className="text-lg font-bold">💰 Payment Requests from Contractor</h2>
            {error && <p className="mt-2 text-sm text-red-500">{error}</p>}
            <ul className="mt-3 divide-y divide-white/10 light:divide-slate-200">
                {open.map((r) => (
                    <li key={r.id} className="space-y-2 py-3">
                        <p className="font-semibold">{r.label}: {formatINRFull(r.amount)}</p>
                        {r.note && <p className="text-sm">{r.note}</p>}
                        <button type="button" disabled={busyId === r.id} onClick={() => pay(r)}
                            className={`${btn} bg-orange-500 text-white hover:bg-orange-600 disabled:opacity-60`}>
                            {busyId === r.id ? "Please wait..." : `Pay ${formatINRFull(r.amount)}`}
                        </button>
                    </li>
                ))}
            </ul>
        </section>
    );
}
