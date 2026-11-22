import { api } from "@/lib/api";

export const getEntries = (projectId) => api(`/projects/${projectId}/ledger`);
export const addEntry = (projectId, { category, title, date, amount }) =>
    api(`/projects/${projectId}/ledger`, { method: "POST", body: { category, title, date, amount: Number(amount) } });
export const deleteEntry = (projectId, id) => api(`/projects/${projectId}/ledger/${id}`, { method: "DELETE" });