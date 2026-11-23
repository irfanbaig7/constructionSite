"use client";

import Link from "next/link";
import useSession from "@/hooks/useSession";
import { useDashboard } from "@/hooks/queries";
import DataState from "@/components/ui/DataState";
import PageHeader from "@/components/ui/PageHeader";
import StatsGrid from "./StatsGrid";
import ActiveProjects from "./ActiveProjects";

export default function DashboardView() {
    const session = useSession();
    const firstName = session?.name?.split(" ")[0];

    return (
        <div className="space-y-6">
            <PageHeader
                title={`Welcome back${firstName ? `, ${firstName}` : ""} 👋`}
                subtitle="Here's what's happening on your projects today"
                action={
                    <Link href="/contractor/projects/new" className="rounded-lg bg-orange-500 px-4 py-2.5 text-sm font-semibold text-white hover:bg-orange-600">
                        + New Project
                    </Link>
                }
            />
            <DataState query={useDashboard()}>
                {(stats) => (
                    <>
                        <StatsGrid stats={stats} />
                        <ActiveProjects projects={stats.activeProjects} />
                    </>
                )}
            </DataState>
        </div>
    );
}