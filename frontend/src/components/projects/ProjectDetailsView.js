"use client";

import { useCallback, useEffect, useState } from "react";
import Link from "next/link";
import { getProjectDetails } from "@/services/projectService";
import { projectTabs } from "@/config/projectTabs";
import ProjectHeader from "./ProjectHeader";
import ProjectTabs from "./ProjectTabs";
import ProjectDialog from "./ProjectDialog";
import OverviewTab from "./tabs/OverviewTab";
import DailyUpdatesTab from "./tabs/DailyUpdatesTab";
import MaterialsTab from "./tabs/MaterialsTab";
import SiteExpensesTab from "./tabs/SiteExpensesTab";
import PaymentsTab from "./tabs/PaymentsTab";

export default function ProjectDetailsView({ id }) {
    // undefined = loading, null = not found
    const [data, setData] = useState(undefined);
    const [tab, setTab] = useState("overview");
    const [dialog, setDialog] = useState(null);

    const load = useCallback(() => getProjectDetails(id).then(setData), [id]);

    useEffect(() => {
        load();
    }, [load]);

    const back = (
        <Link href="/contractor/dashboard" className="text-sm font-medium hover:text-orange-500">
            ← Back to Dashboard
        </Link>
    );

    if (data === undefined) return <p>Loading...</p>;

    if (data === null) {
        return (
            <div className="space-y-4">
                {back}
                <p>Project not found.</p>
            </div>
        );
    }

    const { project, payments, expenses, materials, requests, workerPayments, paymentRequests, updates } = data;
    const open = (type) => () => setDialog({ type });

    return (
        <div className="space-y-6">
            {back}
            <ProjectHeader project={project} onAddUpdate={open("update")} onEdit={open("edit")} />
            <ProjectTabs tabs={projectTabs} active={tab} onChange={setTab} />

            {tab === "overview" && (
                <OverviewTab project={project} payments={payments} expenses={expenses} workerPayments={workerPayments} />
            )}
            {tab === "updates" && <DailyUpdatesTab updates={updates} />}
            {tab === "materials" && (
                <MaterialsTab projectId={project.id} materials={materials} requests={requests} onChanged={load} />
            )}
            {tab === "expenses" && (
                <SiteExpensesTab projectId={project.id} expenses={expenses} onAdd={open("expense")} onChanged={load} />
            )}
            {tab === "payments" && (
                <PaymentsTab
                    project={project}
                    payments={payments}
                    paymentRequests={paymentRequests}
                    workerPayments={workerPayments}
                    onAdd={open("payment")}
                    onAddWorker={open("workerPayment")}
                    onChanged={load}
                />
            )}

            <ProjectDialog dialog={dialog} data={data} onClose={() => setDialog(null)} onSaved={load} />
        </div>
    );
}