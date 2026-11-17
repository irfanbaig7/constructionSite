import StatCard from "@/components/dashboard/StatCard";
import EmptyState from "@/components/ui/EmptyState";
import PrimaryButton from "@/components/ui/PrimaryButton";
import ProgressBar from "@/components/ui/ProgressBar";
import { card } from "@/lib/styles";
import { formatINR } from "@/lib/format";
import { formatDate } from "@/lib/date";
import { formatINRFull, sumAmount } from "@/lib/money";

export default function PaymentsTab({ project, payments, onAdd }) {
    const received = sumAmount(payments);
    const pending = project.budget - received;
    const percent = Math.round((received / project.budget) * 100);

    return (
        <div className="space-y-6">
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
                <StatCard label="Project Budget" value={formatINR(project.budget)} icon="💼" tone="purple" />
                <StatCard label="Received" value={formatINR(received)} icon="💵" tone="green" />
                <StatCard label="Pending" value={formatINR(pending)} icon="⏳" tone="orange" />
            </div>

            <div className={`rounded-2xl p-5 ${card}`}>
                <p className="mb-2 text-sm font-medium">{percent}% of the budget received</p>
                <ProgressBar value={percent} />
            </div>

            <div className="flex items-center justify-between">
                <h2 className="text-lg font-bold">Payments from {project.owner}</h2>
                <PrimaryButton onClick={onAdd}>+ Add Payment</PrimaryButton>
            </div>

            {payments.length === 0 ? (
                <EmptyState text="No payments recorded yet." />
            ) : (
                <ul className={`divide-y divide-white/10 rounded-2xl light:divide-slate-200 ${card}`}>
                    {payments.map((p) => (
                        <li key={p.id} className="flex items-center justify-between gap-4 px-4 py-3">
                            <div>
                                <p className="font-semibold">{p.label}</p>
                                <p className="text-xs">{formatDate(p.date)}</p>
                            </div>
                            <p className="font-bold">{formatINRFull(p.amount)}</p>
                        </li>
                    ))}
                </ul>
            )}
        </div>
    );
}