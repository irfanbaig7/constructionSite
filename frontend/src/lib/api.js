import { clearSession } from "@/lib/session";

const BASE = process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:5000/api";

export class ApiError extends Error {
    constructor(message, status) {
        super(message);
        this.status = status; // 0 = server unreachable
    }
}

export async function api(path, { method = "GET", body } = {}) {
    const isForm = body instanceof FormData;
    let res;
    try {
        res = await fetch(`${BASE}${path}`, {
            method,
            credentials: "include",
            signal: AbortSignal.timeout(isForm ? 120_000 : 30_000),
            headers: body && !isForm ? { "Content-Type": "application/json" } : undefined,
            body: body ? (isForm ? body : JSON.stringify(body)) : undefined,
        });
    } catch (e) {
        throw new ApiError(
            e.name === "TimeoutError" ? "Server jawab nahi de raha. Dobara try karo." : "Server tak nahi pahunch paaye. Internet ya backend check karo.",
            0
        );
    }

    const data = await res.json().catch(() => ({}));
    if (res.status === 401 && !path.startsWith("/auth/")) {
        clearSession();
        window.location.assign("/login");
    }
    if (!res.ok) throw new ApiError(data.message || "Kuch galat ho gaya.", res.status);
    return data;
}