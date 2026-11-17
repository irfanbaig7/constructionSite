import Link from "next/link";
import SectionCard from "@/components/ui/SectionCard";
import Thumb from "@/components/ui/Thumb";
import StatusBadge from "@/components/ui/StatusBadge";
import ProgressBar from "@/components/ui/ProgressBar";
import { formatINR } from "@/lib/format";

// "projects" are already filtered to active ones (with received and stage added) by getDashboardStats.
export default function ActiveProjects({ projects }) {
    return (
        <SectionCard title="Active Projects" href="/contractor/projects">
            {projects.length === 0 ? (
                <p className="text-sm">No active projects yet.</p>
            ) : (
                <ul className="space-y-4">
                    {projects.map((project) => (
                        <li key={project.id}>
                            <Link
                                href={`/contractor/projects/${project.id}`}
                                className="flex items-center gap-4 rounded-xl border border-white/10 p-4 transition hover:border-orange-500/60 light:border-slate-200"
                            >
                                <Thumb className="h-20 w-20" />
                                <div className="min-w-0 flex-1">
                                    <div className="flex items-start justify-between gap-2">
                                        <div className="min-w-0">
                                            <p className="truncate text-lg font-semibold">{project.name}</p>
                                            <p className="text-sm">
                                                {project.owner} • {project.location}
                                            </p>
                                        </div>
                                        <StatusBadge status={project.status} />
                                    </div>
                                    <p className="mt-2 text-sm">
                                        Stage: <span className="font-semibold">{project.stage}</span>
                                    </p>
                                    <p className="text-sm">
                                        Budget {formatINR(project.budget)} • Received {formatINR(project.received)}
                                    </p>
                                    <div className="mt-2">
                                        <ProgressBar value={project.progress} />
                                    </div>
                                </div>
                                <span aria-hidden className="hidden text-2xl sm:block">›</span>
                            </Link>
                        </li>
                    ))}
                </ul>
            )}
        </SectionCard>
    );
}