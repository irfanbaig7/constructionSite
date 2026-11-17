// Mock service (localStorage). When the backend is ready, only this file changes.
import { todayKey } from "@/lib/date";

const KEY = "siteproof_attendance";
const delay = (ms = 200) => new Promise((r) => setTimeout(r, ms));

function read() {
    try {
        return JSON.parse(localStorage.getItem(KEY)) ?? {};
    } catch {
        return {};
    }
}

// { p1: ["w1","w2"], p2: [...] } for today
export async function getTodayAttendance() {
    await delay();
    return read()[todayKey()] ?? {};
}

// Sets the workers of one site for today. A worker can be on only one site, so remove them from the others.
export async function setSiteWorkers(projectId, workerIds) {
    const all = read();
    const key = todayKey();
    const today = { ...(all[key] ?? {}) };
    for (const pid of Object.keys(today)) {
        if (pid !== projectId) today[pid] = today[pid].filter((id) => !workerIds.includes(id));
    }
    today[projectId] = workerIds;
    try {
        localStorage.setItem(KEY, JSON.stringify({ ...all, [key]: today }));
    } catch { }
    return today;
}