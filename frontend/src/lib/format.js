// Indian rupee format: 240000 -> "₹2.4L", 1200 -> "₹1,200"
export function formatINR(value) {
    if (value >= 10000000) return `₹${Number((value / 10000000).toFixed(1))}Cr`;
    if (value >= 100000) return `₹${Number((value / 100000).toFixed(1))}L`;
    return `₹${value.toLocaleString("en-IN")}`;
}

// ISO date -> "Today • 6:20 PM" / "Yesterday • 7:45 PM" / "12 Nov • 5:10 PM"
export function formatUpdateTime(iso) {
    const date = new Date(iso);
    const now = new Date();
    const startOfDay = (d) => new Date(d.getFullYear(), d.getMonth(), d.getDate()).getTime();
    const diffDays = Math.round((startOfDay(now) - startOfDay(date)) / 86400000);

    let label;
    if (diffDays === 0) label = "Today";
    else if (diffDays === 1) label = "Yesterday";
    else label = date.toLocaleDateString("en-IN", { day: "numeric", month: "short" });

    const time = date
        .toLocaleTimeString("en-IN", { hour: "numeric", minute: "2-digit", hour12: true })
        .toUpperCase();

    return `${label} • ${time}`;
}