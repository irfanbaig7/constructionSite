// Mock service. When the backend is ready, only this file changes.
import { workers } from "@/data/workers";

const delay = (ms = 300) => new Promise((resolve) => setTimeout(resolve, ms));

export async function getWorkers() {
    await delay();
    return workers;
}