// "Slab shuttering completed for first floor today" -> "Slab shuttering completed for first floor…"
export function shortTitle(text, words = 6) {
    const parts = text.trim().split(/\s+/);
    return parts.slice(0, words).join(" ") + (parts.length > words ? "…" : "");
}