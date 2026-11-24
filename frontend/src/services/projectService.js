// Real projects, payments, expenses, worker payments and updates via the backend.
import { api } from "@/lib/api";
import { getMaterials, getMaterialRequests } from "@/services/materialService";
import { getPaymentRequests } from "@/services/paymentService";

const NOT_FOUND = "Project not found.";

export const getProjects = () => api("/projects");

// Contractor view: everything.
export async function getProjectDetails(id) {
    try {
        const [{ project, payments }, updates, expenses, materials, requests, workerPayments, paymentRequests] = await Promise.all([
            api(`/projects/${id}`),
            api(`/projects/${id}/updates`),
            api(`/projects/${id}/expenses`),
            getMaterials(id),
            getMaterialRequests(id),
            api(`/projects/${id}/worker-payments`),
            getPaymentRequests(id),
        ]);
        return { project, payments, expenses, materials, requests, workerPayments, paymentRequests, updates };

    } catch (e) {
        if (e.message === NOT_FOUND) return null;
        throw e;
    }
}

// Homeowner view: no contractor expenses, no worker payments.
export async function getOwnerProjectDetails(id) {
    try {
        const [{ project, payments }, updates] = await Promise.all([api(`/projects/${id}`), api(`/projects/${id}/updates`)]);
        return { project, payments, updates };
    } catch (e) {
        if (e.message === NOT_FOUND) return null;
        throw e;
    }
}


export const createProject = (data) => api("/projects", { method: "POST", body: data });
export const editProject = (id, patch) => api(`/projects/${id}`, { method: "PATCH", body: patch });

export const addExpense = (id, { category, title, date, amount }) =>
    api(`/projects/${id}/expenses`, { method: "POST", body: { category, title, date, amount: Number(amount) } });

export const addWorkerPayment = (id, { workerId, amount, date, note }) =>
    api(`/projects/${id}/worker-payments`, { method: "POST", body: { workerId, amount: Number(amount), date, note } });

// formData: summary, workerIds (JSON), materialUsage (JSON), photos (files)
export const addUpdate = (id, formData) => api(`/projects/${id}/updates`, { method: "POST", body: formData });
export const getUpdate = (updateId) => api(`/updates/${updateId}`);

export const getProjectsForOwner = () => getProjects(); // backend returns only this homeowner's projects
