"use client";

export default function ThemeToggle() {
    function toggle() {
        const next = document.documentElement.classList.contains("light") ? "dark" : "light";
        document.documentElement.classList.toggle("light", next === "light");
        try {
            localStorage.setItem("theme", next);
        } catch { }
    }

    return (
        <button
            type="button"
            onClick={toggle}
            aria-label="Toggle light and dark mode"
            className="flex h-9 w-9 items-center justify-center rounded-lg border border-white/10 text-lg hover:bg-white/10 light:border-slate-300 light:hover:bg-slate-100"
        >
            <span className="light:hidden" aria-hidden>☀️</span>
            <span className="hidden light:inline" aria-hidden>🌙</span>
        </button>
    );
}
