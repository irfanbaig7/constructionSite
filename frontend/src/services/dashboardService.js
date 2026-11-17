// Mock service. When the backend is ready, only this file changes.
import { getProjects, getAllDetails } from "@/services/projectService";
import { getWorkers } from "@/services/workerService";
import { getTodayAttendance } from "@/services/attendanceService";

export async function getDashboardData() {
    const [projects, details, workers, attendance] = await Promise.all([
        getProjects(),
        getAllDetails(),
        getWorkers(),
        getTodayAttendance(),
    ]);
    return { projects, workers, details, attendance };
}