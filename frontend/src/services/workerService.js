// Real workers via the backend.
import { api } from "@/lib/api";

export const getWorkers = () => api("/workers");

export const addWorker = ({ name, phone }) => api("/workers", { method: "POST", body: { name, phone } });