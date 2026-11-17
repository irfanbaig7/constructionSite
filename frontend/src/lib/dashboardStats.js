import { isToday } from "@/lib/date";
import { sumAmount } from "@/lib/money";

// Turns raw data into the numbers the contractor dashboard shows.
export function getDashboardStats({ projects, workers, details }) {
    const active = projects.filter((p) => p.status === "in_progress");

    // Workers present today = the highest "workers present" count from today's updates, per site.
    const presentToday = active.reduce((total, p) => {
        const todays = (details[p.id]?.updates ?? []).filter((u) => isToday(u.at));
        return total + Math.max(0, ...todays.map((u) => u.workers));
    }, 0);

    const activeProjects = active.map((p) => {
        const received = sumAmount(details[p.id]?.payments ?? []);
        const stage = p.milestones.find((m) => m.status === "active")?.name ?? "Not started";
        return { ...p, received, stage };
    });

    const pendingPayments = activeProjects.reduce((total, p) => total + (p.budget - p.received), 0);

    const lowStock = active.flatMap((p) =>
        (details[p.id]?.materials ?? [])
            .filter((m) => m.stock < m.minStock)
            .map((m) => ({ project: p.name, material: m.name }))
    );

    return {
        activeSites: active.length,
        totalProjects: projects.length,
        presentToday,
        totalWorkers: workers.length,
        pendingPayments,
        lowStock,
        activeProjects,
    };
}