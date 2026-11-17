import SectionCard from "@/components/ui/SectionCard";
import Thumb from "@/components/ui/Thumb";
import { formatUpdateTime } from "@/lib/format";

const icons = { daily_update: "📸", material: "🧱", expense: "💰" };

export default function RecentUpdates({ updates }) {
    return (
        <SectionCard title="Recent Updates" href="/contractor/projects">
            {updates.length === 0 ? (
                <p className="text-sm">No updates yet.</p>
            ) : (
                <ul className="space-y-4">
                    {updates.slice(0, 5).map((u) => (
                        <li key={u.id} className="flex items-center gap-3">
                            <Thumb icon={icons[u.type]} className="h-12 w-12" />
                            <div className="min-w-0">
                                <p className="text-xs font-medium">{formatUpdateTime(u.at)}</p>
                                <p className="truncate text-sm font-semibold">{u.title}</p>
                                {u.detail && <p className="text-xs">{u.detail}</p>}
                            </div>
                        </li>
                    ))}
                </ul>
            )}
        </SectionCard>
    );
}