import StatCard from "./StatCard";
import { formatINR } from "@/lib/format";

export default function StatsGrid({ stats }) {
    return (
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <StatCard label="Active Sites" value={stats.activeSites} icon="🏗️" tone="blue"
                href="/contractor/projects" hint="View all projects →" />
            <StatCard label="Pending Payments" value={formatINR(stats.pendingPayments)} icon="💰" tone="purple"
                href="/contractor/payments" hint="See who owes what →" />
        </div>
    );
}
