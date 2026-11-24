"use client";

import { CalendarDays } from "lucide-react";
import { useOwnerProjectDetails } from "@/hooks/queries";
import DataState from "@/components/ui/DataState";
import BackLink from "@/components/ui/BackLink";
import EmptyState from "@/components/ui/EmptyState";
import HomeownerUpdateCard from "./HomeownerUpdateCard";

export default function UpdatesHistoryView({ projectId }) {
    return (
        <div className="mx-auto max-w-5xl space-y-6 pb-8">
            <BackLink href="/homeowner/dashboard">Back to project</BackLink>
            <DataState query={useOwnerProjectDetails(projectId)} notFound="Project not found.">
                {({ project, updates }) => (
                    <>
                        <header className="border-b border-white/10 pb-6 light:border-slate-200">
                            <p className="text-sm font-semibold uppercase tracking-[0.16em] text-orange-500">Site progress archive</p>
                            <h1 className="mt-2 text-3xl font-bold tracking-tight sm:text-4xl">Daily updates</h1>
                            <div className="mt-3 flex flex-wrap items-center gap-x-5 gap-y-2 text-sm text-white/60 light:text-slate-600">
                                <span>{project.name}</span>
                                <span className="flex items-center gap-1.5"><CalendarDays size={16} aria-hidden />{updates.length} {updates.length === 1 ? "update" : "updates"} recorded</span>
                            </div>
                        </header>

                        {updates.length === 0 ? <EmptyState text="No daily updates have been posted yet." /> : (
                            <ol className="space-y-4">
                                {updates.map((update, index) => (
                                    <li key={update.id}><HomeownerUpdateCard update={update} latest={index === 0} /></li>
                                ))}
                            </ol>
                        )}
                    </>
                )}
            </DataState>
        </div>
    );
}
