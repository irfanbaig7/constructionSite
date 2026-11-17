export default function ProgressBar({ value }) {
    return (
        <div>
            <div className="h-2 rounded-full bg-white/15 light:bg-slate-200">
                <div className="h-2 rounded-full bg-blue-500" style={{ width: `${value}%` }} />
            </div>
            <p className="mt-1 text-right text-xs font-medium">{value}%</p>
        </div>
    );
}