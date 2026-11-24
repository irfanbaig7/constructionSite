// Only non-sensitive user info lives here (for the UI). The real login is an httpOnly cookie.
const KEY = "siteproof_session";
const EVENT = "siteproof:session";

let cachedRaw;
let cachedSession = null;

export const getSession = () => {
    try {
        const raw = localStorage.getItem(KEY);
        if (raw === cachedRaw) return cachedSession;
        cachedRaw = raw;
        cachedSession = raw ? JSON.parse(raw) : null;
        return cachedSession;
    } catch {
        return null;
    }
};
export const setSession = (user) => {
    try {
        const raw = JSON.stringify(user);
        localStorage.setItem(KEY, raw);
        cachedRaw = raw;
        cachedSession = user;
        window.dispatchEvent(new Event(EVENT));
    } catch { }
};
export const clearSession = () => {
    try {
        localStorage.removeItem(KEY);
        cachedRaw = null;
        cachedSession = null;
        window.dispatchEvent(new Event(EVENT));
    } catch { }
};

export const subscribeSession = (onChange) => {
    const onStorage = (event) => {
        if (event.key === KEY) {
            cachedRaw = undefined;
            onChange();
        }
    };
    window.addEventListener(EVENT, onChange);
    window.addEventListener("storage", onStorage);
    return () => {
        window.removeEventListener(EVENT, onChange);
        window.removeEventListener("storage", onStorage);
    };
};
