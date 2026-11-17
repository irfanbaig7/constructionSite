// Mock service. When the backend is ready, only this file changes.
import { projects } from "@/data/projects";
import { projectDetails } from "@/data/projectDetails";
import { workers } from "@/data/workers";

const delay = (ms = 300) => new Promise((resolve) => setTimeout(resolve, ms));

export async function getDashboardData() {
    await delay();
    return { projects, workers, details: projectDetails };
}