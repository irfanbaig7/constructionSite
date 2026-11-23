import { format, isToday, isYesterday } from "date-fns";

// 240000 -> "₹2.4L", 1200 -> "₹1,200"
export function formatINR(value) {
    const short = (n) => Number(n.toFixed(1));
    if (value >= 1e7) return `₹${short(value / 1e7)}Cr`;
    if (value >= 1e5) return `₹${short(value / 1e5)}L`;
    return `₹${value.toLocaleString("en-IN")}`;
}

// "Today • 6:20 PM" / "Yesterday • 7:45 PM" / "12 Nov • 5:10 PM"
export function formatUpdateTime(iso) {
    const d = new Date(iso);
    const day = isToday(d) ? "Today" : isYesterday(d) ? "Yesterday" : format(d, "d MMM");
    return `${day} • ${format(d, "h:mm a")}`;
}