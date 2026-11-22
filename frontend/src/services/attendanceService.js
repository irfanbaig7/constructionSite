// Real attendance via the backend.
import { api } from "@/lib/api";

// { p1: ["workerId", ...], ... } for today
export const getTodayAttendance = () => api("/attendance/today");

// Sets the workers of one site for today; returns the updated map for all sites.
export const setSiteWorkers = (projectId, workerIds) =>
    api(`/attendance/today/${projectId}`, { method: "PUT", body: { workerIds } });