import { card } from "@/lib/styles";
import { formatINR } from "@/lib/format";
import { sumAmount } from "@/lib/money";

function Bar({ label, value, max, tone }) {
    const percent = max ? Math.min(100, Math.round((value / max) * 100)) : 0;
    return (
        <div>
            <div className="flex justify-between text-sm">
                <span>{label}</span>
                <span className="font-semibold">{formatINR(value)}</span>
            </div>
            <div className="mt-1 h-3 rounded-full bg-white/15 light:bg-slate-200">
                <div className={`h-3 rounded-full ${tone}`} style={{ width: `${percent}%` }} />
            </div>
        </div>
    );
}

export default function ReportsTab({ project, payments, expenses, materials }) {
    const received = sumAmount(payments);
    const siteExpenses = sumAmount(expenses);
    const balance = received - siteExpenses;

    return (
        <div className="grid gap-6 xl:grid-cols-2">
            <section className={`rounded-2xl p-5 ${card}`}>
                <h2 className="text-lg font-bold">Money overview</h2>
                <div className="mt-4 space-y-4">
                    <Bar label="Project Budget" value={project.budget} max={project.budget} tone="bg-purple-500" />
                    <Bar label="Payments Received" value={received} max={project.budget} tone="bg-green-500" />
                    <Bar label="Site Expenses" value={siteExpenses} max={project.budget} tone="bg-orange-500" />
                </div>
                <p className="mt-5 text-sm font-medium">Balance in hand (Received − Site Expenses)</p>
                <p className="text-2xl font-bold">{formatINR(Math.abs(balance))}{balance < 0 ? " short" : ""}</p>
            </section>

            <section className={`rounded-2xl p-5 ${card}`}>
                <h2 className="text-lg font-bold">Material usage</h2>
                <div className="mt-4 space-y-4">
                    {materials.map((m) => {
                        const percent = Math.round((m.used / m.target) * 100);
                        return (
                            <div key={m.name}>
                                <div className="flex justify-between text-sm">
                                    <span>{m.name}</span>
                                    <span className="font-semibold">{percent}%</span>
                                </div>
                                <div className="mt-1 h-3 rounded-full bg-white/15 light:bg-slate-200">
                                    <div className="h-3 rounded-full bg-blue-500" style={{ width: `${percent}%` }} />
                                </div>
                            </div>
                        );
                    })}
                </div>
            </section>
        </div>
    );
}