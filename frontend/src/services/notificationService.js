// Mock service. The homeowner side can read "siteproof_notifications" later.
const KEY = "siteproof_notifications";

function read() {
    try {
        return JSON.parse(localStorage.getItem(KEY)) ?? [];
    } catch {
        return [];
    }
}

export const getNotifications = () => read();

export function notifyLowStock({ projectId, project, owner, material }) {
    const list = read();
    const item = {
        id: `n${Date.now()}`,
        type: "low_stock",
        projectId, project, owner, material,
        at: new Date().toISOString(),
    };
    try {
        localStorage.setItem(KEY, JSON.stringify([item, ...list]));
    } catch { }
    return item;
}