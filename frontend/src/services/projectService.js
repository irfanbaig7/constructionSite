// Mock service. When the backend is ready, only this file changes.
import { projects } from "@/data/projects";
import { projectDetails } from "@/data/projectDetails";

const delay = (ms = 300) => new Promise((resolve) => setTimeout(resolve, ms));

export async function getProjects() {
    await delay();
    return projects;
}

export async function getProjectDetails(id) {
    await delay();
    const project = projects.find((p) => p.id === id);
    if (!project) return null;
    const extra = projectDetails[id] ?? { payments: [], expenses: [], materials: [], updates: [] };
    return { project, ...extra };
}