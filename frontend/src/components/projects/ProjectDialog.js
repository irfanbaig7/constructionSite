
"use client";

import FormDialog from "@/components/ui/FormDialog";
import { expenseCategories } from "@/config/expenseCategories";
import { addExpense, editProject } from "@/services/projectService";
import { createPaymentRequest } from "@/services/paymentService";
import { sumAmount, formatINRFull } from "@/lib/money";
import { todayKey } from "@/lib/date";
import DailyUpdateDialog from "./DailyUpdateDialog";
import WorkerPaymentDialog from "./WorkerPaymentDialog";

const n = Number;

export default function ProjectDialog({ dialog, data, onClose, onSaved }) {
    if (!dialog) return null;
    const { project, payments } = data;
    const id = project.id;
    const save = (fn) => async (f) => {
        await fn(f);
        onSaved();
    };

    switch (dialog.type) {
        case "update":
            return <DailyUpdateDialog projectId={id} onClose={onClose} onSaved={onSaved} />;

        case "workerPayment":
            return <WorkerPaymentDialog projectId={id} onClose={onClose} onSaved={onSaved} />;

        case "payment":
            return (
                <FormDialog
                    title="Request payment from homeowner"
                    submitLabel="Send to homeowner"
                    onClose={onClose}
                    fields={[
                        { name: "label", label: "Payment purpose", placeholder: "e.g. 3rd installment (slab)", required: true, span: true },
                        { name: "amount", label: "Amount (₹)", type: "number", min: "1", required: true },
                        { name: "note", label: "Note (optional)", span: true },
                    ]}
                    validate={(f) => {
                        const left = project.budget - sumAmount(payments);
                        return n(f.amount) > left ? `Amount cannot exceed the remaining budget of ${formatINRFull(left)}.` : "";
                    }}
                    onSubmit={save((f) => createPaymentRequest(id, { ...f, amount: n(f.amount) }))}
                />
            );

        case "expense":
            return (
                <FormDialog
                    title="Add site expense"
                    submitLabel="Add expense"
                    onClose={onClose}
                    fields={[
                        { name: "title", label: "Expense description", placeholder: "e.g. Refreshments, drill machine", required: true, span: true },
                        { name: "category", label: "Category", options: expenseCategories.map((c) => c.name), defaultValue: expenseCategories[0].name },
                        { name: "amount", label: "Amount (₹)", type: "number", min: "1", required: true },
                        { name: "date", label: "Date", type: "date", required: true, defaultValue: todayKey(), span: true },
                    ]}
                    onSubmit={save((f) => addExpense(id, f))}
                />
            );

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
