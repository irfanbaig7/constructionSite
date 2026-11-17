export default function ProjectTabs({ tabs, active, onChange }) {
    return (
        <div className="overflow-x-auto border-b border-white/10 light:border-slate-200">
            <div className="flex min-w-max gap-1">
                {tabs.map((tab) => (
                    <button
                        key={tab.key}
                        type="button"
                        onClick={() => onChange(tab.key)}
                        className={`border-b-2 px-4 py-3 text-sm font-semibold transition hover:text-orange-500 ${active === tab.key ? "border-orange-500 text-orange-500" : "border-transparent"
                            }`}
                    >
                        {tab.label}
                    </button>
                ))}
            </div>
        </div>
    );
}