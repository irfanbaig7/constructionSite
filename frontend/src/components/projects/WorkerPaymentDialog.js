"use client";

import { useEffect, useState } from "react";
import Modal from "@/components/ui/Modal";
import FormDialog from "@/components/ui/FormDialog";
import { getWorkers } from "@/services/workerService";
import { addWorkerPayment } from "@/services/projectService";
import { todayKey } from "@/lib/date";

export default function WorkerPaymentDialog({ projectId, onClose, onSaved }) {
    const [workers, setWorkers] = useState(null);

    useEffect(() => {
        getWorkers().then(setWorkers).catch(() => setWorkers([]));
    }, []);

    if (!workers) return null;
    if (workers.length === 0)
        return (
            <Modal title="Worker payment" onClose={onClose}>
                <p className="text-sm">Pehle Workers page par worker add karo.</p>
            </Modal>
        );

    return (
        <FormDialog
            title="Worker ko payment"
            submitLabel="Payment likho"
            onClose={onClose}
            fields={[
                { name: "workerId", label: "Worker", options: workers.map((w) => ({ value: w.id, label: w.name })), defaultValue: workers[0].id, span: true },
                { name: "amount", label: "Amount (₹)", type: "number", min: "1", required: true },
                { name: "date", label: "Date", type: "date", required: true, defaultValue: todayKey() },
                { name: "note", label: "Note (optional)", span: true, placeholder: "e.g. hafte ki mazdoori" },
            ]}
            onSubmit={async (f) => {
                await addWorkerPayment(projectId, f);
                onSaved();
            }}
        />
    );
}