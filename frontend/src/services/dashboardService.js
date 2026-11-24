import { getProjects } from "@/services/projectService";

export async function getDashboardData() {
    return { projects: await getProjects() };
}
