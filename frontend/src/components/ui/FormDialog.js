"use client";

import { useState } from "react";
import Modal from "./Modal";
import Field from "./Field";

// fields: [{ name, label, type, as, options (strings or {value,label}), span, defaultValue, ...input props }]
export default function FormDialog({ title, fields, initial = {}, submitLabel = "Save", validate, onSubmit, onClose }) {
    const [form, setForm] = useState(() =>
        Object.fromEntries(fields.map((f) => [f.name, initial[f.name] ?? f.defaultValue ?? ""]))
    );
    const [error, setError] = useState("");
    const update = (e) => setForm({ ...form, [e.target.name]: e.target.value });

    async function submit(e) {
        e.preventDefault();
        const msg = validate?.(form);
        if (msg) return setError(msg);
        await onSubmit(form);
        onClose();
    }

    return (
        <Modal title={title} onClose={onClose}>
            <form onSubmit={submit} className="space-y-4">
                {error && (
                    <p className="rounded-lg border border-red-500/40 bg-red-500/10 px-3 py-2 text-sm text-red-500">{error}</p>
                )}
                <div className="grid gap-4 sm:grid-cols-2">
                    {fields.map(({ options, span, defaultValue, ...f }) => (
                        <Field
                            key={f.name}
                            {...f}
                            as={options ? "select" : f.as}
                            value={form[f.name]}
                            onChange={update}
                            className={span ? "sm:col-span-2" : ""}
                        >
                            {options?.map((o) => {
                                const [value, label] = typeof o === "string" ? [o, o] : [o.value, o.label];
                                return <option key={value} value={value}>{label}</option>;
                            })}
                        </Field>
                    ))}
                </div>
                <div className="flex gap-3">
                    <button type="submit" className="rounded-lg bg-orange-500 px-4 py-2.5 text-sm font-semibold text-white hover:bg-orange-600">
                        {submitLabel}
                    </button>
                    <button
                        type="button"
                        onClick={onClose}
                        className="rounded-lg border border-white/15 px-4 py-2.5 text-sm font-semibold hover:border-orange-500 light:border-slate-300"
                    >
                        Cancel
                    </button>
                </div>
            </form>
        </Modal>
    );
}