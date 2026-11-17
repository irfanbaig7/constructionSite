// Placeholder for project photos. Real photos replace this component's content later.
export default function Thumb({ icon = "🏠", className = "h-14 w-14" }) {
    return (
        <div
            className={`flex shrink-0 items-center justify-center rounded-xl bg-gradient-to-br from-orange-500/30 to-blue-500/30 text-2xl ${className}`}
        >
            {icon}
        </div>
    );
}