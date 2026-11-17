import SectionCard from "@/components/ui/SectionCard";
import Thumb from "@/components/ui/Thumb";
import StatusBadge from "@/components/ui/StatusBadge";
import ProgressBar from "@/components/ui/ProgressBar";

export default function ActiveProjects({ projects }) {
    const active = projects.filter((p) => p.status === "in_progress");

    return (
        <SectionCard title="Active Projects" href="/contractor/projects">
            {active.length === 0 ? (
                <p className="text-sm">No active projects yet.</p>
            ) : (
                <ul className="space-y-5">
                    {active.map((project) => (
                        <li key={project.id} className="flex items-center gap-4">
                            <Thumb className="h-16 w-16" />
                            <div className="min-w-0 flex-1">
                                <div className="flex items-start justify-between gap-2">
                                    <div className="min-w-0">
                                        <p className="truncate font-semibold">{project.name}</p>
                                        <p className="text-sm">{project.location}</p>
                                    </div>
                                    <StatusBadge status={project.status} />
                                </div>
                                <div className="mt-2">
                                    <ProgressBar value={project.progress} />
                                </div>
                            </div>
                        </li>
                    ))}
                </ul>
            )}
        </SectionCard>
    );
}