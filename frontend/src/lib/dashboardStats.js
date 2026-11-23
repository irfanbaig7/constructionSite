export function getDashboardStats({ projects, workers, attendance }) {
    const active = projects.filter((p) => p.status === "in_progress");
    const activeProjects = active.map((p) => ({
        ...p,
        stage: p.milestones.find((m) => m.status === "active")?.name ?? "Not started",
    }));

    return {
        activeSites: active.length,
        totalProjects: projects.length,
        presentToday: active.reduce((t, p) => t + (attendance[p.id]?.length ?? 0), 0),
        totalWorkers: workers.length,
        pendingPayments: activeProjects.reduce((t, p) => t + p.budget - p.received, 0),
        activeProjects,
    };
}