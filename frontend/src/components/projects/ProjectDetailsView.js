"use client";

import { useState } from "react";
import Link from "next/link";
import { useQueryClient } from "@tanstack/react-query";
import { useProjectDetails } from "@/hooks/queries";
import { projectTabs } from "@/config/projectTabs";
import DataState from "@/components/ui/DataState";
import ProjectHeader from "./ProjectHeader";
import ProjectTabs from "./ProjectTabs";
import ProjectDialog from "./ProjectDialog";
import OverviewTab from "./tabs/OverviewTab";
import DailyUpdatesTab from "./tabs/DailyUpdatesTab";
import MaterialsTab from "./tabs/MaterialsTab";
import SiteExpensesTab from "./tabs/SiteExpensesTab";
import PaymentsTab from "./tabs/PaymentsTab";

function Body({ data }) {
    const qc = useQueryClient();
    const refresh = () => qc.invalidateQueries();
    const [tab, setTab] = useState("overview");
    const [dialog, setDialog] = useState(null);
    const open = (type) => () => setDialog({ type });
    const { project, payments, expenses, materials, requests, paymentRequests, workerPayments, updates } = data;

    const tabs = {
        overview: <OverviewTab project={project} payments={payments} expenses={expenses} workerPayments={workerPayments} onEdit={open("edit")} />,
        updates: <DailyUpdatesTab updates={updates} />,
        materials: <MaterialsTab projectId={project.id} materials={materials} requests={requests} onChanged={refresh} />,
        expenses: <SiteExpensesTab expenses={expenses} onAdd={open("expense")} />,
        payments: (
            <PaymentsTab project={project} payments={payments} paymentRequests={paymentRequests} workerPayments={workerPayments}
                onAdd={open("payment")} onAddWorker={open("workerPayment")} onChanged={refresh} />
        ),
    };

    return (
        <>
            <ProjectHeader project={project} onAddUpdate={open("update")} />
            <ProjectTabs tabs={projectTabs} active={tab} onChange={setTab} />
            {tabs[tab]}
            <ProjectDialog dialog={dialog} data={data} onClose={() => setDialog(null)} onSaved={refresh} />
        </>
    );
}

export default function ProjectDetailsView({ id }) {
    return (
        <div className="space-y-6">
            <Link href="/contractor/dashboard" className="text-sm font-medium hover:text-orange-500">← Back to Dashboard</Link>
            <DataState query={useProjectDetails(id)} notFound="Project not found.">
                {(data) => <Body data={data} />}
            </DataState>
        </div>
    );
}
