"use client";

import { useRouter } from "next/navigation";
import ThemeToggle from "@/components/ThemeToggle";
import { logout } from "@/services/authService";
import { ROUTES } from "@/lib/routes";

const iconButton =
    "flex h-9 w-9 items-center justify-center rounded-lg border border-white/10 text-lg hover:bg-white/10 light:border-slate-300 light:hover:bg-slate-200";

export default function Topbar({ onMenuClick }) {
    const router = useRouter();

    function handleLogout() {
        logout();
        router.replace(ROUTES.login);
    }

    return (
        <header className="sticky top-0 z-30 flex items-center justify-between border-b border-white/10 bg-[#0a0f1c]/80 px-4 py-3 backdrop-blur light:border-slate-200 light:bg-slate-100/80 sm:px-6">
            <button type="button" onClick={onMenuClick} aria-label="Open menu" className={`${iconButton} lg:hidden`}>
                ☰
            </button>
            <div className="hidden lg:block" />

            <div className="flex items-center gap-2 sm:gap-3">
                <ThemeToggle />
                <button type="button" aria-label="Notifications" className={iconButton}>
                    🔔
                </button>
                <button
                    type="button"
                    onClick={handleLogout}
                    className="rounded-lg border border-white/10 px-3 py-2 text-sm font-medium hover:border-orange-500 hover:text-orange-500 light:border-slate-300"
                >
                    Logout
                </button>
            </div>
        </header>
    );
}