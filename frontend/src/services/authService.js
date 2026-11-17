// Mock auth service. When the backend is ready, only this file changes.
// The forms and pages keep calling login(), signup(), getSession() and logout() as they are.
import { demoUsers } from "@/data/users";

const USERS_KEY = "siteproof_users";
const SESSION_KEY = "siteproof_session";

const delay = (ms = 500) => new Promise((resolve) => setTimeout(resolve, ms));

function read(key, fallback) {
    try {
        const raw = localStorage.getItem(key);
        return raw ? JSON.parse(raw) : fallback;
    } catch {
        return fallback;
    }
}

function write(key, value) {
    try {
        localStorage.setItem(key, JSON.stringify(value));
    } catch { }
}

const allUsers = () => [...demoUsers, ...read(USERS_KEY, [])];
const toSession = (user) => ({ id: user.id, name: user.name, email: user.email, role: user.role });

export async function login({ email, password }) {
    await delay();
    const user = allUsers().find((u) => u.email.toLowerCase() === email.trim().toLowerCase());
    if (!user || user.password !== password) {
        throw new Error("Incorrect email or password.");
    }
    const session = toSession(user);
    write(SESSION_KEY, session);
    return session;
}

export async function signup({ name, email, password, role }) {
    await delay();
    const exists = allUsers().some((u) => u.email.toLowerCase() === email.trim().toLowerCase());
    if (exists) {
        throw new Error("An account with this email already exists.");
    }
    const user = { id: `u${Date.now()}`, name: name.trim(), email: email.trim(), password, role };
    write(USERS_KEY, [...read(USERS_KEY, []), user]);
    const session = toSession(user);
    write(SESSION_KEY, session);
    return session;
}

export function getSession() {
    return read(SESSION_KEY, null);
}

export function logout() {
    try {
        localStorage.removeItem(SESSION_KEY);
    } catch { }
}