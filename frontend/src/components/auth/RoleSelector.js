const roles = [
    { key: "contractor", label: "Contractor", icon: "🏗️", hint: "I manage construction sites" },
    { key: "homeowner", label: "Homeowner", icon: "🏠", hint: "I am building my home" },
];

export default function RoleSelector({ value, onChange }) {
    return (
        <div>
            <p className="mb-1.5 text-sm font-medium">I am a</p>
            <div className="grid grid-cols-2 gap-3">
                {roles.map((role) => (
                    <button
                        key={role.key}
                        type="button"
                        aria-pressed={value === role.key}
                        onClick={() => onChange(role.key)}
                        className={`rounded-lg border px-3 py-3 text-left transition ${value === role.key
                                ? "border-orange-500 bg-orange-500/10"
                                : "border-white/15 hover:border-orange-500/60 light:border-slate-300"
                            }`}
                    >
                        <span className="text-xl">{role.icon}</span>
                        <span className="mt-1 block text-sm font-semibold">{role.label}</span>
                        <span className="block text-xs">{role.hint}</span>
                    </button>
                ))}
            </div>
        </div>
    );
}