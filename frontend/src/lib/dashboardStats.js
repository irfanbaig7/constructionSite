export function getDashboardStats({ projects }) {
    const active = projects.filter((p) => p.status === "in_progress");
    const activeProjects = active.map((p) => ({
        ...p,
        stage: p.milestones.find((m) => m.status === "active")?.name ?? "Not started",
    }));

    return {
        activeSites: active.length,
        totalProjects: projects.length,
        pendingPayments: activeProjects.reduce((t, p) => t + p.budget - p.received, 0),
        activeProjects,
    };
}
