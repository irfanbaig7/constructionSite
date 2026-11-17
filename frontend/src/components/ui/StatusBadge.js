const styles = {
    in_progress: {
        label: "In Progress",
        className: "bg-green-500/20 text-green-300 light:bg-green-100 light:text-green-800",
    },
    completed: {
        label: "Completed",
        className: "bg-blue-500/20 text-blue-300 light:bg-blue-100 light:text-blue-800",
    },
    planned: {
        label: "Planned",
        className: "bg-slate-500/20 text-slate-300 light:bg-slate-200 light:text-slate-800",
    },
};

export default function StatusBadge({ status }) {
    const { label, className } = styles[status] ?? styles.planned;
    return (
        <span className={`whitespace-nowrap rounded-full px-2.5 py-1 text-xs font-semibold ${className}`}>
            {label}
        </span>
    );
}