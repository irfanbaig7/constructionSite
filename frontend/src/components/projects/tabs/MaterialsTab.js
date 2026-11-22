"use client";

import { useState } from "react";
import EmptyState from "@/components/ui/EmptyState";
import ProgressBar from "@/components/ui/ProgressBar";
import PrimaryButton from "@/components/ui/PrimaryButton";
import FormDialog from "@/components/ui/FormDialog";
import { card } from "@/lib/styles";
import { createMaterialRequest, quoteRequest, cancelRequest, updateMaterialLimits } from "@/services/materialService";
import { formatINRFull } from "@/lib/money";

const OPEN = ["pending", "owner_bringing", "quote_needed", "awaiting_payment"];
const units = ["bags", "pcs", "tons", "kg", "litres", "cft"];
const STATUS = {
    pending: "Homeowner ke jawab ka intezaar",
    owner_bringing: "Homeowner khud laa rahe hain",
    quote_needed: "Homeowner ne kaha aap laao: quote bhejo",
    awaiting_payment: "Quote bheja, payment ka intezaar",
    fulfilled: "Mil gaya",
    cancelled: "Cancel",
};
const icons = { Cement: "🪣", Bricks: "🧱", Steel: "🔩", Sand: "🏖️" };
const num = (v) => Number(v || 0);
const small = "rounded-md border border-white/15 px-2.5 py-1 text-xs font-medium hover:border-orange-500 light:border-slate-300";

export default function MaterialsTab({ projectId, materials, requests, onChanged }) {
    const [dialog, setDialog] = useState(null); // { type: "request" | "limits" | "quote", material?, request? }
    const [error, setError] = useState("");
    const close = () => setDialog(null);

    async function run(fn) {
        setError("");
        try {
            await fn();
            onChanged();
        } catch (e) {
            setError(e.message);
        }
    }

    const open = requests.filter((r) => OPEN.includes(r.status));
    const past = requests.filter((r) => !OPEN.includes(r.status)).slice(0, 5);
    const m = dialog?.material;

    return (
        <div className="space-y-6">
            <div className="flex flex-wrap items-center justify-between gap-3">
                <p className="max-w-xl text-sm">
                    Material aap khud add nahi kar sakte. Request homeowner ko jaati hai: wo khud laayenge, ya aapse mangwayenge (payment ke baad).
                </p>
                <PrimaryButton onClick={() => setDialog({ type: "request" })}>+ Material maango</PrimaryButton>
            </div>
            {error && <p className="text-sm text-red-500">{error}</p>}

            {open.length > 0 && (
                <section className={`rounded-2xl p-5 ${card}`}>
                    <h2 className="text-lg font-bold">Khuli requests</h2>
                    <ul className="mt-3 divide-y divide-white/10 light:divide-slate-200">
                        {open.map((r) => (
                            <li key={r.id} className="flex flex-wrap items-center justify-between gap-3 py-3">
                                <div>
                                    <p className="font-semibold">{r.name} • {r.quantity} {r.unit}{r.amount ? ` • ${formatINRFull(r.amount)}` : ""}</p>
                                    <p className="text-xs">{STATUS[r.status]}{r.note && ` • ${r.note}`}</p>
                                </div>
                                <div className="flex gap-2">
                                    {["quote_needed", "awaiting_payment"].includes(r.status) && (
                                        <button type="button" className={small} onClick={() => setDialog({ type: "quote", request: r })}>
                                            {r.status === "quote_needed" ? "Quote bhejo" : "Quote badlo"}
                                        </button>
                                    )}
                                    <button type="button" className={`${small} hover:text-red-500`}
                                        onClick={() => window.confirm("Request cancel karni hai?") && run(() => cancelRequest(projectId, r.id))}>
                                        Cancel
                                    </button>
                                </div>
                            </li>
                        ))}
                    </ul>
                </section>
            )}

            {materials.length === 0 ? (
                <EmptyState text="Abhi koi material nahi. 'Material maango' se homeowner ko request bhejo." />
            ) : (
                <div className="grid gap-4 sm:grid-cols-2">
                    {materials.map((x) => {
                        const low = x.minStock > 0 && x.stock < x.minStock;
                        const percent = x.target > 0 ? Math.min(100, Math.round((x.used / x.target) * 100)) : 0;
                        return (
                            <div key={x.id} className={`rounded-2xl p-5 ${card}`}>
                                <div className="flex items-center gap-3">
                                    <span className="text-3xl">{icons[x.name] ?? "📦"}</span>
                                    <div className="min-w-0 flex-1">
                                        <p className="text-lg font-bold">{x.name}</p>
                                        <p className="text-sm">
                                            {x.target > 0
                                                ? `Laga ${x.used.toLocaleString("en-IN")} ${x.unit} / kul ${x.target.toLocaleString("en-IN")} ${x.unit}`
                                                : `Laga ${x.used.toLocaleString("en-IN")} ${x.unit} (kul target set nahi)`}
                                        </p>
                                    </div>
                                    {low && (
                                        <span className="rounded-full bg-red-500/20 px-2.5 py-1 text-xs font-semibold text-red-300 light:bg-red-100 light:text-red-800">
                                            Kam hai
                                        </span>
                                    )}
                                </div>
                                <div className="mt-4"><ProgressBar value={percent} /></div>
                                <p className="mt-2 text-sm">
                                    Abhi stock: <span className="font-semibold">{x.stock.toLocaleString("en-IN")} {x.unit}</span>
                                    {x.minStock > 0 && <span className="text-xs"> (alert {x.minStock} se kam par)</span>}
                                </p>
                                <div className="mt-3 flex flex-wrap gap-2">
                                    <button type="button" className={small} onClick={() => setDialog({ type: "request", material: x })}>
                                        Homeowner ko batao / maango
                                    </button>
                                    <button type="button" className={small} onClick={() => setDialog({ type: "limits", material: x })}>
                                        Target / alert
                                    </button>
                                </div>
                            </div>
                        );
                    })}
                </div>
            )}

            {past.length > 0 && (
                <section className={`rounded-2xl p-5 ${card}`}>
                    <h2 className="text-lg font-bold">Pichhli requests</h2>
                    <ul className="mt-3 space-y-2 text-sm">
                        {past.map((r) => (
                            <li key={r.id}>
                                {r.name} {r.deliveredQty ?? r.quantity} {r.unit}: {STATUS[r.status]}
                                {r.status === "fulfilled" && ` (${r.source === "owner" ? "homeowner laaye" : "aapne laaye"})`}
                            </li>
                        ))}
                    </ul>
                </section>
            )}

            {dialog?.type === "request" && (
                <FormDialog
                    title={m ? `${m.name} maango` : "Naya material maango"}
                    submitLabel="Homeowner ko bhejo"
                    onClose={close}
                    initial={m ? { name: m.name, unit: m.unit } : {}}
                    fields={[
                        { name: "name", label: "Material", required: true, readOnly: !!m, placeholder: "e.g. Cement" },
                        { name: "unit", label: "Unit", options: units, disabled: !!m, defaultValue: units[0] },
                        { name: "quantity", label: "Kitna chahiye", type: "number", min: "0.01", step: "any", required: true },
                        ...(m ? [] : [
                            { name: "target", label: "Kul kitna lagega (optional)", type: "number", min: "0", step: "any" },
                            { name: "minStock", label: "Kam hone ka alert (optional)", type: "number", min: "0", step: "any" },
                        ]),
                        { name: "note", label: "Note (optional)", span: true, placeholder: "e.g. Cement khatam hone ko hai, jaldi chahiye" },
                    ]}
                    onSubmit={async (f) => {
                        await createMaterialRequest(projectId, { ...f, quantity: num(f.quantity), target: num(f.target), minStock: num(f.minStock) });
                        onChanged();
                    }}
                />
            )}

            {dialog?.type === "limits" && (
                <FormDialog
                    title={`${m.name}: target aur alert`}
                    onClose={close}
                    initial={{ target: m.target, minStock: m.minStock }}
                    fields={[
                        { name: "target", label: `Kul kitna lagega (${m.unit})`, type: "number", min: "0", step: "any", required: true },
                        { name: "minStock", label: `Kam hone ka alert (${m.unit})`, type: "number", min: "0", step: "any", required: true },
                    ]}
                    onSubmit={async (f) => {
                        await updateMaterialLimits(projectId, m.id, { target: num(f.target), minStock: num(f.minStock) });
                        onChanged();
                    }}
                />
            )}

            {dialog?.type === "quote" && (
                <FormDialog
                    title={`${dialog.request.name}: quote`}
                    submitLabel="Quote bhejo"
                    onClose={close}
                    initial={{ quantity: dialog.request.quantity, amount: dialog.request.amount ?? "" }}
                    fields={[
                        { name: "quantity", label: `Quantity (${dialog.request.unit})`, type: "number", min: "0.01", step: "any", required: true },
                        { name: "amount", label: "Total amount (₹)", type: "number", min: "1", required: true },
                    ]}
                    onSubmit={async (f) => {
                        await quoteRequest(projectId, dialog.request.id, { quantity: num(f.quantity), amount: num(f.amount) });
                        onChanged();
                    }}
                />
            )}
        </div>
    );
}