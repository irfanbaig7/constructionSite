import EmptyState from "@/components/ui/EmptyState";
import Thumb from "@/components/ui/Thumb";
import { card } from "@/lib/styles";
import { formatUpdateTime } from "@/lib/format";

export default function DailyUpdatesTab({ updates }) {
    if (updates.length === 0) return <EmptyState text="No daily updates yet." />;

    return (
        <ul className="space-y-4">
            {updates.map((u) => (
                <li key={u.id} className={`rounded-2xl p-5 ${card}`}>
                    <div className="flex flex-wrap items-center justify-between gap-2">
                        <p className="font-semibold">{formatUpdateTime(u.at)}</p>
                        <p className="text-sm">👷 {u.workers} workers present</p>
                    </div>
                    <p className="mt-2">{u.summary}</p>

                    {u.materials.length > 0 && (
                        <div className="mt-3 flex flex-wrap gap-2">
                            {u.materials.map((m) => (
                                <span
                                    key={m}
                                    className="rounded-full border border-white/15 px-3 py-1 text-xs font-medium light:border-slate-300"
                                >
                                    🧱 {m}
                                </span>
                            ))}
                        </div>
                    )}

                    <div className="mt-4 flex flex-wrap gap-2">
                        {Array.from({ length: u.photos }).map((_, i) => (
                            <Thumb key={i} icon="📷" className="h-16 w-16" />
                        ))}
                    </div>
                </li>
            ))}
        </ul>
    );
}