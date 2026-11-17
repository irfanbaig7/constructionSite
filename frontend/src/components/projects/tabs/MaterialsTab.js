import EmptyState from "@/components/ui/EmptyState";
import ProgressBar from "@/components/ui/ProgressBar";
import { card } from "@/lib/styles";

const icons = { Cement: "🪣", Bricks: "🧱", Steel: "🔩", Sand: "🏖️" };

export default function MaterialsTab({ materials }) {
    if (materials.length === 0) return <EmptyState text="No materials added yet." />;

    return (
        <div className="grid gap-4 sm:grid-cols-2">
            {materials.map((m) => {
                const low = m.stock < m.minStock;
                return (
                    <div key={m.name} className={`rounded-2xl p-5 ${card}`}>
                        <div className="flex items-center gap-3">
                            <span className="text-3xl">{icons[m.name] ?? "📦"}</span>
                            <div className="min-w-0 flex-1">
                                <p className="text-lg font-bold">{m.name}</p>
                                <p className="text-sm">
                                    Used {m.used.toLocaleString("en-IN")} {m.unit} of {m.target.toLocaleString("en-IN")} {m.unit}
                                </p>
                            </div>
                            {low && (
                                <span className="rounded-full bg-red-500/20 px-2.5 py-1 text-xs font-semibold text-red-300 light:bg-red-100 light:text-red-800">
                                    Low stock
                                </span>
                            )}
                        </div>
                        <div className="mt-4">
                            <ProgressBar value={Math.round((m.used / m.target) * 100)} />
                        </div>
                        <p className="mt-3 text-sm">
                            In stock:{" "}
                            <span className="font-semibold">
                                {m.stock.toLocaleString("en-IN")} {m.unit}
                            </span>
                        </p>
                    </div>
                );
            })}
        </div>
    );
}