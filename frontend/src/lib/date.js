// "2026-08-25" -> "25 Aug 2026"
export function formatDate(iso) {
    return new Date(iso).toLocaleDateString("en-IN", { day: "numeric", month: "short", year: "numeric" });
}

export function isToday(iso) {
    return new Date(iso).toDateString() === new Date().toDateString();
}