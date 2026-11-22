import StatCard from "./StatCard";
import { formatINR } from "@/lib/format";

export default function StatsGrid({ stats }) {
    return (
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-3">
            <StatCard label="Active Sites" value={stats.activeSites} icon="🏗️" tone="blue"
                href="/contractor/projects" hint="View all projects →" />
            <StatCard label="Today's Attendance" value={`${stats.presentToday} / ${stats.totalWorkers}`} icon="👷" tone="green"
                href="/contractor/attendance" hint="Assign & view workers →" />
            <StatCard label="Pending Payments" value={formatINR(stats.pendingPayments)} icon="💰" tone="purple"
                href="/contractor/payments" hint="See who owes what →" />
        </div>
    );
}