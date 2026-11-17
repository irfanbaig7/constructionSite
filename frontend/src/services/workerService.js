// Mock service (localStorage for added workers). When the backend is ready, only this file changes.
import { workers as baseWorkers } from "@/data/workers";

const KEY = "siteproof_workers";
const delay = (ms = 300) => new Promise((resolve) => setTimeout(resolve, ms));

function readAdded() {
    try {
        return JSON.parse(localStorage.getItem(KEY)) ?? [];
    } catch {
        return [];
    }
}

export async function getWorkers() {
    await delay();
    return [...baseWorkers, ...readAdded()];
}

export async function addWorker({ name, phone }) {
    const digits = phone.replace(/\D/g, "").slice(-10);
    const worker = {
        id: `w${Date.now()}`,
        name: name.trim(),
        phone: `+91 ${digits.slice(0, 5)} ${digits.slice(5)}`,
    };
    try {
        localStorage.setItem(KEY, JSON.stringify([...readAdded(), worker]));
    } catch { }
    return worker;
}