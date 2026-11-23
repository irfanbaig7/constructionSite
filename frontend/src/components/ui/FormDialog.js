"use client";

import { useForm } from "react-hook-form";
import { notify } from "@/lib/notify";
import Modal from "./Modal";
import Field from "./Field";

// fields: [{ name, label, type, as, options (strings or {value,label}), span, defaultValue, ...input props }]
export default function FormDialog({ title, fields, initial = {}, submitLabel = "Save", validate, onSubmit, onClose }) {
    const defaults = Object.fromEntries(fields.map((f) => [f.name, initial[f.name] ?? f.defaultValue ?? ""]));
    const { register, handleSubmit, formState: { isSubmitting } } = useForm({ defaultValues: defaults });

    const submit = handleSubmit(async (values) => {
        const data = { ...defaults, ...Object.fromEntries(Object.entries(values).filter(([, v]) => v !== undefined)) }; // disabled fields keep their value
        const problem = validate?.(data);
        if (problem) return notify.error(problem);
        try {
            await onSubmit(data);
            onClose();
        } catch (e) {
            notify.error(e.message);
        }
    });

    return (
        <Modal title={title} onClose={onClose}>
            <form onSubmit={submit} className="space-y-4">
                <div className="grid gap-4 sm:grid-cols-2">
                    {fields.map(({ options, span, defaultValue, ...f }) => (
                        <Field key={f.name} {...f} {...register(f.name)} as={options ? "select" : f.as} className={span ? "sm:col-span-2" : ""}>
                            {options?.map((o) => {
                                const [value, label] = typeof o === "string" ? [o, o] : [o.value, o.label];
                                return <option key={value} value={value}>{label}</option>;
                            })}
                        </Field>
                    ))}
                </div>
                <div className="flex gap-3">
                    <button type="submit" disabled={isSubmitting} className="rounded-lg bg-orange-500 px-4 py-2.5 text-sm font-semibold text-white hover:bg-orange-600 disabled:opacity-60">
                        {isSubmitting ? "Saving..." : submitLabel}
                    </button>
                    <button type="button" onClick={onClose} className="rounded-lg border border-white/15 px-4 py-2.5 text-sm font-semibold hover:border-orange-500 light:border-slate-300">
                        Cancel
                    </button>
                </div>
            </form>
        </Modal>
    );
}