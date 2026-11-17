import StatCard from "./StatCard";
import { formatINR } from "@/lib/format";

export default function StatsGrid({ stats }) {
    const first = stats.lowStock[0];
    const extra = stats.lowStock.length - 1;
    const lowStockHint = first
        ? `${first.material} • ${first.project}${extra > 0 ? ` +${extra} more` : ""}`
        : "All stock is fine";

    return (
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
            <StatCard label="Active Sites" value={stats.activeSites} icon="🏗️" tone="blue"
                href="/contractor/projects" hint="View all projects →" />
            <StatCard label="Today's Attendance" value={`${stats.presentToday} / ${stats.totalWorkers}`} icon="👷" tone="green"
                href="/contractor/attendance" hint="Assign & view workers →" />
            <StatCard label="Pending Payments" value={formatINR(stats.pendingPayments)} icon="💰" tone="purple"
                href="/contractor/payments" hint="See who owes what →" />
            <StatCard label="Low Stock" value={stats.lowStock.length} icon="⚠️" tone="orange"
                href="/contractor/stock" hint={lowStockHint} />
        </div>
    );
}