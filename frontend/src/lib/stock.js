// All materials below minStock on active sites.
export function getLowStock(projects, details) {
    return projects
        .filter((p) => p.status === "in_progress")
        .flatMap((p) =>
            (details[p.id]?.materials ?? [])
                .filter((m) => m.stock < m.minStock)
                .map((m) => ({
                    projectId: p.id,
                    project: p.name,
                    owner: p.owner,
                    material: m.name,
                    unit: m.unit,
                    stock: m.stock,
                    minStock: m.minStock,
                }))
        );
}