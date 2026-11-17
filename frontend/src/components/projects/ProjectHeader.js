import StatusBadge from "@/components/ui/StatusBadge";
import ProgressBar from "@/components/ui/ProgressBar";
import PrimaryButton from "@/components/ui/PrimaryButton";
import Thumb from "@/components/ui/Thumb";
import { card } from "@/lib/styles";
import { formatDate } from "@/lib/date";

export default function ProjectHeader({ project, onAddUpdate, onEdit }) {
    return (
        <div className={`rounded-2xl p-5 ${card}`}>
            <div className="flex flex-wrap items-start justify-between gap-4">
                <div className="flex items-center gap-4">
                    <Thumb className="h-20 w-20" />
                    <div>
                        <div className="flex flex-wrap items-center gap-3">
                            <h1 className="text-2xl font-bold sm:text-3xl">{project.name}</h1>
                            <StatusBadge status={project.status} />
                        </div>
                        <p className="mt-1 text-sm">
                            Owner: {project.owner} • {project.location}
                        </p>
                        <p className="text-sm">
                            {formatDate(project.startDate)} → {formatDate(project.expectedEnd)}
                        </p>
                    </div>
                </div>
                <div className="flex gap-2">
                    <PrimaryButton onClick={onAddUpdate}>+ Add Daily Update</PrimaryButton>
                    <PrimaryButton variant="outline" onClick={onEdit}>Edit</PrimaryButton>
                </div>
            </div>
            <div className="mt-5">
                <ProgressBar value={project.progress} />
            </div>
        </div>
    );
}