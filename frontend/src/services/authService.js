import { ApiError, api } from "@/lib/api";
import { getSession, setSession, clearSession } from "@/lib/session";

export { getSession };

const save = ({ user }) => {
    setSession(user);
    return user;
};

const canRetryLogin = (error) => [0, 502, 503, 504].includes(error.status);
const loginUnavailable = "SiteProof is taking longer than expected to start. Please try signing in again.";

async function signIn(body) {
    const session = await api("/auth/login", { method: "POST", body, timeoutMs: 15_000 });
    // A hosting startup page can contain HTML instead of a session.
    if (!session.user) throw new ApiError(loginUnavailable, 503);
    return save(session);
}

export async function login(body, onConnecting) {
    try {
        return await signIn(body);
    } catch (error) {
        if (!canRetryLogin(error)) throw error;
    }

    onConnecting?.();
    const deadline = performance.now() + 70_000;
    while (performance.now() < deadline) {
        const remaining = Math.ceil(deadline - performance.now());
        const health = await api("/health", { timeoutMs: Math.min(5_000, remaining) }).catch(() => null);
        if (health?.ok === true) {
            try {
                return await signIn(body);
            } catch (error) {
                if (!canRetryLogin(error)) throw error;
                break;
            }
        }
        const wait = Math.min(2_000, deadline - performance.now());
        if (wait > 0) await new Promise((resolve) => setTimeout(resolve, wait));
    }
    throw new ApiError(loginUnavailable, 503);
}

export const signup = (body) => api("/auth/signup", { method: "POST", body }).then(save);
export const fetchSession = () => api("/auth/me").then(save); // asks the server, so an expired cookie is caught
export const updateProfile = (body) => api("/auth/me", { method: "PATCH", body }).then(save);
export const changePassword = (body) => api("/auth/password", { method: "POST", body }).then(save);

export async function logout() {
    await api("/auth/logout", { method: "POST" });
    clearSession();
}
