// Mock service (added/edited data lives in localStorage). When the backend is ready, only this file changes.
import { projects as baseProjects } from "@/data/projects";
import { projectDetails as baseDetails } from "@/data/projectDetails";

const KEY = "siteproof_project_extras";
const delay = (ms = 300) => new Promise((resolve) => setTimeout(resolve, ms));
const EMPTY = { project: {}, payments: [], expenses: [], updates: [], materials: [] };
const uid = (p) => `${p}${Date.now()}`;

function readAll() {
    try {
        return JSON.parse(localStorage.getItem(KEY)) ?? {};
    } catch {
        return {};
    }
}

function writeAll(all) {
    localStorage.setItem(KEY, JSON.stringify(all)); // throws if storage is full
}

const extrasOf = (all, id) => ({ ...EMPTY, ...(all[id] ?? {}) });

function mutate(id, fn) {
    const all = readAll();
    all[id] = fn(extrasOf(all, id));
    writeAll(all);
}

function mergeDetails(id, all) {
    const base = baseDetails[id] ?? { payments: [], expenses: [], materials: [], updates: [] };
    const x = extrasOf(all, id);
    // a saved material replaces the base one with the same name
    const materials = [...new Map([...base.materials, ...x.materials].map((m) => [m.name, m])).values()];
    return {
        payments: [...base.payments, ...x.payments],
        expenses: [...x.expenses, ...base.expenses].sort((a, b) => b.date.localeCompare(a.date)),
        materials,
        updates: [...x.updates, ...base.updates],
    };
}

export async function getProjects() {
    await delay();
    const all = readAll();
    return baseProjects.map((p) => ({ ...p, ...extrasOf(all, p.id).project }));
}

export async function getProjectDetails(id) {
    await delay();
    const all = readAll();
    const base = baseProjects.find((p) => p.id === id);
    if (!base) return null;
    return { project: { ...base, ...extrasOf(all, id).project }, ...mergeDetails(id, all) };
}

// { p1: {payments, expenses, materials, updates}, ... } for the dashboard
export async function getAllDetails() {
    const all = readAll();
    return Object.fromEntries(baseProjects.map((p) => [p.id, mergeDetails(p.id, all)]));
}

export async function addPayment(id, { label, date, amount }) {
    mutate(id, (x) => ({ ...x, payments: [...x.payments, { id: uid("pay"), label: label.trim(), date, amount: Number(amount) }] }));
}

export async function addExpense(id, { category, title, date, amount }) {
    mutate(id, (x) => ({ ...x, expenses: [{ id: uid("e"), category, title: title.trim(), date, amount: Number(amount) }, ...x.expenses] }));
}

// export async function addUpdate(id, { summary, workerIds, photos, materials }) {
//     const update = {
//         id: uid("u"),
//         at: new Date().toISOString(),
//         summary: summary.trim(),
//         workers: workerIds.length,
//         workerIds,
//         photos, // array of data URLs (old sample data has a number here)
//         materials: materials.split(",").map((m) => m.trim()).filter(Boolean),
//     };
//     mutate(id, (x) => ({ ...x, updates: [update, ...x.updates] }));
// }


// Add a new material or replace an existing one (matched by name).

export async function saveMaterial(id, material) {
    mutate(id, (x) => ({ ...x, materials: [...x.materials.filter((m) => m.name !== material.name), material] }));
}

export async function editProject(id, patch) {
    mutate(id, (x) => ({ ...x, project: { ...x.project, ...patch } }));
}

export async function getProjectsForOwner(email) {
    const list = await getProjects();
    return list.filter((p) => p.ownerEmail?.toLowerCase() === email.toLowerCase());
}

// Same as getProjectDetails but WITHOUT the contractor's private site expenses.
export async function getOwnerProjectDetails(id) {
    const d = await getProjectDetails(id);
    if (!d) return null;
    const { expenses: _private, ...safe } = d;
    return safe;
}

export async function addUpdate(id, { summary, workerIds, photos, materials, delivered }) {
    const update = {
        id: uid("u"),
        at: new Date().toISOString(),
        summary: summary.trim(),
        workers: workerIds.length,
        workerIds,
        photos,
        materials: materials.split(",").map((m) => m.trim()).filter(Boolean),
        delivered: (delivered ?? "").trim(), // new material received today (optional)
    };
    mutate(id, (x) => ({ ...x, updates: [update, ...x.updates] }));
}