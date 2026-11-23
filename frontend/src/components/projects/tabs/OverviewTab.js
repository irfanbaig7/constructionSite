
import StatCard from "@/components/dashboard/StatCard";
import { card } from "@/lib/styles";
import { formatINR } from "@/lib/format";
import { formatDate } from "@/lib/date";
import { sumAmount } from "@/lib/money";
import PrimaryButton from "@/components/ui/PrimaryButton";

const milestoneStyle = {
    done: { icon: "✅", label: "Done" },
    active: { icon: "🔄", label: "In progress" },
    pending: { icon: "⚪", label: "Pending" },
};

export default function OverviewTab({ project, payments, expenses, workerPayments, onEdit }) {
    const received = sumAmount(payments);
    const pending = project.budget - received;
    const siteExpenses = sumAmount(expenses) + sumAmount(workerPayments);

    const info = [
        ["Owner", project.owner],
        ["Location", project.location],
        ["Type", project.type],
        ["Area", project.area],
        ["Rooms", project.rooms],
        ["Start Date", formatDate(project.startDate)],
        ["Expected End", formatDate(project.expectedEnd)],
        ["Owner email", project.ownerEmail],
        ["Owner phone", project.ownerPhone],
    ];

    return (
        <div className="space-y-6">
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
                <StatCard label="Progress" value={`${project.progress}%`} icon="📈" tone="blue" />
                <StatCard label="Project Budget" value={formatINR(project.budget)} icon="💼" tone="purple" />
                <StatCard label="Payments Pending" value={formatINR(pending)} icon="⏳" tone="orange" />
                <StatCard label="Total Site Expenses" value={formatINR(siteExpenses)} icon="🧾" tone="green" hint="Site expenses + Worker payments" />
            </div>

            <div className="grid gap-6 xl:grid-cols-3">
                <section className={`rounded-2xl p-5 xl:col-span-2 ${card}`}>
                    <div className="flex items-center justify-between gap-3">
                        <h2 className="text-lg font-bold">Project Info</h2>
                        <PrimaryButton variant="outline" onClick={onEdit}>✎ Edit details</PrimaryButton>
                    </div>
                    <dl className="mt-4 grid gap-4 sm:grid-cols-2">
                        {info.map(([label, value]) => (
                            <div key={label}>
                                <dt className="text-xs font-medium">{label}</dt>
                                <dd className="font-semibold">{value}</dd>
                            </div>
                        ))}
                    </dl>
                </section>

                <section className={`rounded-2xl p-5 ${card}`}>
                    <h2 className="text-lg font-bold">Milestones</h2>
                    <ul className="mt-4 space-y-3">
                        {project.milestones.map((m) => (
                            <li key={m.name} className="flex items-center justify-between gap-3">
                                <span className="font-medium">
                                    {milestoneStyle[m.status].icon} {m.name}
                                </span>
                                <span className="text-xs font-medium">{milestoneStyle[m.status].label}</span>
                            </li>
                        ))}
                    </ul>
                </section>
            </div>
        </div>
    );
}
