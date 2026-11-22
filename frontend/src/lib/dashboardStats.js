import { sumAmount } from "@/lib/money";

export function getDashboardStats({ projects, workers, details, attendance }) {
    const active = projects.filter((p) => p.status === "in_progress");

    const presentToday = active.reduce((t, p) => t + (attendance[p.id]?.length ?? 0), 0);

    const activeProjects = active.map((p) => {
        const received = sumAmount(details[p.id]?.payments ?? []);
        const stage = p.milestones.find((m) => m.status === "active")?.name ?? "Not started";
        return { ...p, received, stage };
    });

    const pendingPayments = activeProjects.reduce((t, p) => t + (p.budget - p.received), 0);

    return {
        activeSites: active.length,
        totalProjects: projects.length,
        presentToday,
        totalWorkers: workers.length,
        pendingPayments,
        activeProjects,
    };
}