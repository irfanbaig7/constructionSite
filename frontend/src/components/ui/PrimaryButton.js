// A button without onClick is shown disabled ("Coming soon"). Pass onClick when the feature is ready.
export default function PrimaryButton({ children, onClick, variant = "solid" }) {
    const styles =
        variant === "solid"
            ? "bg-orange-500 text-white enabled:hover:bg-orange-600"
            : "border border-white/15 light:border-slate-300 enabled:hover:border-orange-500 enabled:hover:text-orange-500";

    return (
        <button
            type="button"
            onClick={onClick}
            disabled={!onClick}
            title={onClick ? undefined : "Coming soon"}
            className={`rounded-lg px-4 py-2.5 text-sm font-semibold transition disabled:cursor-not-allowed disabled:opacity-60 ${styles}`}
        >
            {children}
        </button>
    );
}