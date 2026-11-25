import { api } from "@/lib/api";
import { getSession, setSession, clearSession } from "@/lib/session";

export { getSession };

const save = ({ user }) => {
    setSession(user);
    return user;
};

export const login = (body) => api("/auth/login", { method: "POST", body }).then(save);
export const signup = (body) => api("/auth/signup", { method: "POST", body }).then(save);
export const fetchSession = () => api("/auth/me").then(save); // asks the server, so an expired cookie is caught
export const updateProfile = (body) => api("/auth/me", { method: "PATCH", body }).then(save);
export const changePassword = (body) => api("/auth/password", { method: "POST", body }).then(save);

export async function logout() {
    await api("/auth/logout", { method: "POST" });
    clearSession();
}
