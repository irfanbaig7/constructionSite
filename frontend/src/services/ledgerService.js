// Homeowner's own notebook (localStorage). When the backend is ready, only this file changes.
const KEY = "siteproof_owner_ledger";

function readAll() {
    try {
        return JSON.parse(localStorage.getItem(KEY)) ?? {};
    } catch {
        return {};
    }
}

export async function getEntries(projectId) {
    return readAll()[projectId] ?? [];
}

export async function addEntry(projectId, { category, title, date, amount }) {
    const all = readAll();
    const entry = { id: `l${Date.now()}`, category, title: title.trim(), date, amount: Number(amount) };
    all[projectId] = [entry, ...(all[projectId] ?? [])];
    localStorage.setItem(KEY, JSON.stringify(all));
}

export async function deleteEntry(projectId, id) {
    const all = readAll();
    all[projectId] = (all[projectId] ?? []).filter((e) => e.id !== id);
    localStorage.setItem(KEY, JSON.stringify(all));
}