"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import useSession from "@/hooks/useSession";
import { getContractorDashboard } from "@/services/projectService";
import { getProjectStats } from "@/lib/stats";
import PageHeader from "@/components/ui/PageHeader";
import StatsGrid from "./StatsGrid";
import ActiveProjects from "./ActiveProjects";
import RecentUpdates from "./RecentUpdates";

export default function DashboardView() {
    const session = useSession();
    const [data, setData] = useState(null);

    useEffect(() => {
        getContractorDashboard().then(setData);
    }, []);

    const firstName = session?.name?.split(" ")[0];

    return (
        <div className="space-y-6">
            <PageHeader
                title={`Welcome back${firstName ? `, ${firstName}` : ""} 👋`}
                subtitle="Here's what's happening on your projects today"
                action={
                    <Link
                        href="/contractor/projects/new"
                        className="rounded-lg bg-orange-500 px-4 py-2.5 text-sm font-semibold text-white hover:bg-orange-600"
                    >
                        + New Project
                    </Link>
                }
            />

            {!data ? (
                <p>Loading...</p>
            ) : (
                <>
                    <StatsGrid stats={getProjectStats(data.projects)} />
                    <div className="grid gap-6 xl:grid-cols-3">
                        <div className="xl:col-span-2">
                            <ActiveProjects projects={data.projects} />
                        </div>
                        <RecentUpdates updates={data.updates} />
                    </div>
                </>
            )}
        </div>
    );
}