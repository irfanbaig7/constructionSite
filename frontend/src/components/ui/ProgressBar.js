export default function ProgressBar({ value, showLabel = true, tone = "blue", label = "Progress" }) {
    const safeValue = Math.max(0, Math.min(100, Number(value) || 0));
    return (
        <div>
            <div role="progressbar" aria-label={label} aria-valuemin={0} aria-valuemax={100} aria-valuenow={safeValue} className="h-2.5 overflow-hidden rounded-full bg-white/15 light:bg-slate-200">
                <div className={`h-full rounded-full transition-[width] duration-500 ${tone === "orange" ? "bg-orange-500" : "bg-blue-500"}`} style={{ width: `${safeValue}%` }} />
            </div>
            {showLabel && <p className="mt-1 text-right text-xs font-medium">{safeValue}%</p>}
        </div>
    );
}
