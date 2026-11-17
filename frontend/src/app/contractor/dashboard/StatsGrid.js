import StatCard from "./StatCard";
import { formatINR } from "@/lib/format";

export default function StatsGrid({ stats }) {
    return (
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
            <StatCard label="Total Projects" value={stats.total} icon="🏗️" tone="blue" />
            <StatCard label="In Progress" value={stats.inProgress} icon="⏳" tone="orange" />
            <StatCard label="Completed" value={stats.completed} icon="✅" tone="green" />
            <StatCard label="Total Spent" value={formatINR(stats.totalSpent)} icon="💰" tone="purple" />
        </div>
    );
}