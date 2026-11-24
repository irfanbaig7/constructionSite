
import { clearSession } from "@/lib/session";

const BASE = process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:5000/api";

export const ORIGIN = BASE.replace(/\/api$/, "");

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
            e.name === "TimeoutError" ? "The server is not responding. Please try again." : "Unable to connect to the server. Check your internet connection or backend.",
            0
        );
    }

    const data = await res.json().catch(() => ({}));
    if (res.status === 401 && !path.startsWith("/auth/")) {
        clearSession();
        // This utility runs outside React, so a full redirect is intentional here.
        // eslint-disable-next-line @next/next/no-location-assign-relative-destination
        window.location.assign("/login");
    }
    if (!res.ok) throw new ApiError(data.message || "Something went wrong.", res.status);
    return data;
}
