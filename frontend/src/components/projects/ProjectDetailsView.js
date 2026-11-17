"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { getProjectDetails } from "@/services/projectService";
import { projectTabs } from "@/config/projectTabs";
import ProjectHeader from "./ProjectHeader";
import ProjectTabs from "./ProjectTabs";
import OverviewTab from "./tabs/OverviewTab";
import DailyUpdatesTab from "./tabs/DailyUpdatesTab";
import MaterialsTab from "./tabs/MaterialsTab";
import SiteExpensesTab from "./tabs/SiteExpensesTab";
import PaymentsTab from "./tabs/PaymentsTab";
import ReportsTab from "./tabs/ReportsTab";

export default function ProjectDetailsView({ id }) {
    // undefined = loading, null = not found
    const [data, setData] = useState(undefined);
    const [tab, setTab] = useState("overview");

    useEffect(() => {
        getProjectDetails(id).then(setData);
    }, [id]);

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

    const { project, payments, expenses, materials, updates } = data;

    return (
        <div className="space-y-6">
            {back}
            <ProjectHeader project={project} />
            <ProjectTabs tabs={projectTabs} active={tab} onChange={setTab} />

            {tab === "overview" && <OverviewTab project={project} payments={payments} expenses={expenses} />}
            {tab === "updates" && <DailyUpdatesTab updates={updates} />}
            {tab === "materials" && <MaterialsTab materials={materials} />}
            {tab === "expenses" && <SiteExpensesTab expenses={expenses} />}
            {tab === "payments" && <PaymentsTab project={project} payments={payments} />}
            {tab === "reports" && (
                <ReportsTab project={project} payments={payments} expenses={expenses} materials={materials} />
            )}
        </div>
    );
}