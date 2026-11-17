"use client";

import { useEffect, useState } from "react";

export default function ThemeToggle() {
    const [theme, setTheme] = useState("dark");

    useEffect(() => {
        setTheme(document.documentElement.classList.contains("light") ? "light" : "dark");
    }, []);

    function toggle() {
        const next = theme === "dark" ? "light" : "dark";
        setTheme(next);
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
            {theme === "dark" ? "☀️" : "🌙"}
        </button>
    );
}