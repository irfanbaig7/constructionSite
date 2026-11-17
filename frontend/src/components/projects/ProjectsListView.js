"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { getProjects } from "@/services/projectService";
import PageHeader from "@/components/ui/PageHeader";
import BackLink from "@/components/ui/BackLink";
import ProjectTabs from "./ProjectTabs";
import StatusBadge from "@/components/ui/StatusBadge";
import ProgressBar from "@/components/ui/ProgressBar";
import Thumb from "@/components/ui/Thumb";
import EmptyState from "@/components/ui/EmptyState";
import { card } from "@/lib/styles";

const tabs = [
    { key: "all", label: "All" },
    { key: "in_progress", label: "Ongoing" },
    { key: "completed", label: "Completed" },
    { key: "planned", label: "Upcoming" },
];

export default function ProjectsListView() {
    const [projects, setProjects] = useState(null);
    const [tab, setTab] = useState("all");

    useEffect(() => {
        getProjects().then(setProjects);
    }, []);

    const list = (projects ?? []).filter((p) => tab === "all" || p.status === tab);

    return (
        <div className="space-y-6">
            <BackLink />
            <PageHeader
                title="My Projects"
                subtitle={projects ? `${projects.length} projects` : "Loading..."}
                action={
                    <Link
                        href="/contractor/projects/new"
                        className="rounded-lg bg-orange-500 px-4 py-2.5 text-sm font-semibold text-white hover:bg-orange-600"
                    >
                        + New Project
                    </Link>
                }
            />
            <ProjectTabs tabs={tabs} active={tab} onChange={setTab} />

            {projects && list.length === 0 && <EmptyState text="No projects here." />}

            <ul className="space-y-4">
                {list.map((p) => (
                    <li key={p.id}>
                        <Link
                            href={`/contractor/projects/${p.id}`}
                            className={`flex items-center gap-4 rounded-2xl p-4 transition hover:border-orange-500/60 ${card}`}
                        >
                            <Thumb className="h-16 w-16" />
                            <div className="min-w-0 flex-1">
                                <div className="flex items-start justify-between gap-2">
                                    <div className="min-w-0">
                                        <p className="truncate font-semibold">{p.name}</p>
                                        <p className="text-sm">{p.owner} • {p.location}</p>
                                    </div>
                                    <StatusBadge status={p.status} />
                                </div>
                                <div className="mt-2"><ProgressBar value={p.progress} /></div>
                            </div>
                        </Link>
                    </li>
                ))}
            </ul>
        </div>
    );
}