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
export const sendVerification = () => api("/auth/send-verification", { method: "POST" });
export const verifyEmail = (token) => api("/auth/verify-email", { method: "POST", body: { token } });
export const forgotPassword = (email) => api("/auth/forgot-password", { method: "POST", body: { email } });
export const resetPassword = (token, password) => api("/auth/reset-password", { method: "POST", body: { token, password } });

export async function logout() {
    await api("/auth/logout", { method: "POST" });
    clearSession();
}
