import { getProjects } from "@/services/projectService";
import { getWorkers } from "@/services/workerService";
import { getTodayAttendance } from "@/services/attendanceService";

export async function getDashboardData() {
    const [projects, workers, attendance] = await Promise.all([getProjects(), getWorkers(), getTodayAttendance()]);
    return { projects, workers, attendance };
}