"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import useSession from "@/hooks/useSession";
import { getDashboardData } from "@/services/dashboardService";
import { getDashboardStats } from "@/lib/dashboardStats";
import PageHeader from "@/components/ui/PageHeader";
import StatsGrid from "./StatsGrid";
import ActiveProjects from "./ActiveProjects";

export default function DashboardView() {
    const session = useSession();
    const [stats, setStats] = useState(null);

    useEffect(() => {
        getDashboardData().then((raw) => setStats(getDashboardStats(raw)));
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

            {!stats ? (
                <p>Loading...</p>
            ) : (
                <>
                    <StatsGrid stats={stats} />
                    <ActiveProjects projects={stats.activeProjects} />
                </>
            )}
        </div>
    );
}