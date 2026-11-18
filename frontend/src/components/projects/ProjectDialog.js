"use client";

import FormDialog from "@/components/ui/FormDialog";
import { expenseCategories } from "@/config/expenseCategories";
import { addPayment, addExpense, saveMaterial, editProject } from "@/services/projectService";
import DailyUpdateDialog from "./DailyUpdateDialog";
import { sumAmount, formatINRFull } from "@/lib/money";
import { todayKey } from "@/lib/date";

const n = Number;
const units = ["bags", "pcs", "tons", "kg", "litres"];

export default function ProjectDialog({ dialog, data, onClose, onSaved }) {
    if (!dialog) return null;
    const { project, payments, materials } = data;
    const id = project.id;
    const save = (fn) => async (f) => {
        await fn(f);
        onSaved();
    };

    switch (dialog.type) {
        case "update":
            return <DailyUpdateDialog projectId={id} onClose={onClose} onSaved={onSaved} />;

        case "payment":
            return (
                <FormDialog
                    title="Add payment"
                    submitLabel="Add payment"
                    onClose={onClose}
                    fields={[
                        { name: "label", label: "Label", placeholder: "e.g. 3rd installment", required: true, span: true },
                        { name: "amount", label: "Amount (₹)", type: "number", min: "1", required: true },
                        { name: "date", label: "Date", type: "date", required: true, defaultValue: todayKey() },
                    ]}
                    validate={(f) => {
                        const left = project.budget - sumAmount(payments);
                        return n(f.amount) > left ? `Amount is more than the pending ${formatINRFull(left)}.` : "";
                    }}
                    onSubmit={save((f) => addPayment(id, f))}
                />
            );

        case "expense":
            return (
                <FormDialog
                    title="Add site expense"
                    submitLabel="Add expense"
                    onClose={onClose}
                    fields={[
                        { name: "title", label: "Title", placeholder: "e.g. Sand delivery", required: true, span: true },
                        { name: "category", label: "Category", options: expenseCategories.map((c) => c.name), defaultValue: expenseCategories[0].name },
                        { name: "amount", label: "Amount (₹)", type: "number", min: "1", required: true },
                        { name: "date", label: "Date", type: "date", required: true, defaultValue: todayKey() },
                    ]}
                    onSubmit={save((f) => addExpense(id, f))}
                />
            );

        case "material":
            return (
                <FormDialog
                    title="Add material"
                    submitLabel="Add material"
                    onClose={onClose}
                    fields={[
                        { name: "name", label: "Material name", placeholder: "e.g. Cement", required: true },
                        { name: "unit", label: "Unit", options: units, defaultValue: units[0] },
                        { name: "target", label: "Total needed", type: "number", min: "1", step: "any", required: true },
                        { name: "stock", label: "In stock now", type: "number", min: "0", step: "any", required: true },
                        { name: "minStock", label: "Low stock alert below", type: "number", min: "0", step: "any", required: true },
                    ]}
                    validate={(f) =>
                        materials.some((m) => m.name.toLowerCase() === f.name.trim().toLowerCase())
                            ? "This material already exists. Use Update stock."
                            : ""
                    }
                    onSubmit={save((f) =>
                        saveMaterial(id, { name: f.name.trim(), unit: f.unit, used: 0, target: n(f.target), stock: n(f.stock), minStock: n(f.minStock) })
                    )}
                />
            );

        case "stock": {
            const m = dialog.material;
            return (
                <FormDialog
                    title={`Update ${m.name}`}
                    onClose={onClose}
                    initial={m}
                    fields={[
                        { name: "used", label: `Used so far (${m.unit})`, type: "number", min: "0", step: "any", required: true },
                        { name: "target", label: `Total needed (${m.unit})`, type: "number", min: "1", step: "any", required: true },
                        { name: "stock", label: `In stock now (${m.unit})`, type: "number", min: "0", step: "any", required: true },
                        { name: "minStock", label: "Low stock alert below", type: "number", min: "0", step: "any", required: true },
                    ]}
                    onSubmit={save((f) =>
                        saveMaterial(id, { ...m, used: n(f.used), target: n(f.target), stock: n(f.stock), minStock: n(f.minStock) })
                    )}
                />
            );
        }

        case "edit":
            return (
                <FormDialog
                    title="Edit project"
                    onClose={onClose}
                    initial={project}
                    fields={[
                        { name: "name", label: "Project name", required: true, span: true },
                        { name: "owner", label: "Homeowner name", required: true },
                        { name: "location", label: "Location", required: true },
                        {
                            name: "status",
                            label: "Status",
                            options: [
                                { value: "planned", label: "Planned" },
                                { value: "in_progress", label: "In Progress" },
                                { value: "completed", label: "Completed" },
                            ],
                        },
                        { name: "progress", label: "Progress (%)", type: "number", min: "0", max: "100", required: true },
                        { name: "budget", label: "Budget (₹)", type: "number", min: "1", required: true },
                        { name: "expectedEnd", label: "Expected end date", type: "date", required: true },
                    ]}
                    validate={(f) => {
                        if (n(f.progress) < 0 || n(f.progress) > 100) return "Progress must be between 0 and 100.";
                        if (f.expectedEnd <= project.startDate) return "Expected end must be after the start date.";
                        if (n(f.budget) < sumAmount(payments)) return "Budget cannot be less than payments already received.";
                        return "";
                    }}
                    onSubmit={save((f) =>
                        editProject(id, {
                            name: f.name.trim(),
                            owner: f.owner.trim(),
                            location: f.location.trim(),
                            status: f.status,
                            progress: n(f.progress),
                            budget: n(f.budget),
                            expectedEnd: f.expectedEnd,
                        })
                    )}
                />
            );

        default:
            return null;
    }
}