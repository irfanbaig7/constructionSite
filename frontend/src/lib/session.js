// Only non-sensitive user info lives here (for the UI). The real login is an httpOnly cookie.
const KEY = "siteproof_session";

export const getSession = () => {
    try {
        return JSON.parse(localStorage.getItem(KEY));
    } catch {
        return null;
    }
};
export const setSession = (user) => {
    try {
        localStorage.setItem(KEY, JSON.stringify(user));
    } catch { }
};
export const clearSession = () => {
    try {
        localStorage.removeItem(KEY);
    } catch { }
};