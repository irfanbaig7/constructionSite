"use client";

import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import ThemeToggle from "@/components/ThemeToggle";
import useSession from "@/hooks/useSession";
import { logout } from "@/services/authService";
import { ROUTES } from "@/lib/routes";
import Logo from "@/components/Logo"

const iconButton =
    "flex h-9 w-9 items-center justify-center rounded-lg border border-white/10 text-lg hover:bg-white/10 light:border-slate-300 light:hover:bg-slate-200";

export default function Topbar({ onMenuClick, profileHref }) {
    const router = useRouter();
    const session = useSession();
    const [open, setOpen] = useState(false);
    const ref = useRef(null);

    // Close on outside click or Escape
    useEffect(() => {
        if (!open) return;
        const onClick = (e) => { if (!ref.current?.contains(e.target)) setOpen(false); };
        const onKey = (e) => { if (e.key === "Escape") setOpen(false); };
        document.addEventListener("mousedown", onClick);
        document.addEventListener("keydown", onKey);
        return () => {
            document.removeEventListener("mousedown", onClick);
            document.removeEventListener("keydown", onKey);
        };
    }, [open]);

    function handleLogout() {
        logout();
        router.replace(ROUTES.login);
    }

    return (
        <header className="sticky top-0 z-30 flex items-center justify-between border-b border-white/10 bg-[#0a0f1c]/80 px-4 py-3 backdrop-blur light:border-slate-200 light:bg-slate-100/80 sm:px-6">
            {onMenuClick ? (
                <>
                    <button type="button" onClick={onMenuClick} aria-label="Open menu" className={`${iconButton} lg:hidden`}>☰</button>
                    <div className="hidden lg:block" />
                </>
            ) : (
                <Logo />
            )}

            <div className="flex items-center gap-2 sm:gap-3">
                <ThemeToggle />
                <div ref={ref} className="relative">
                    <button
                        type="button"
                        onClick={() => setOpen((o) => !o)}
                        aria-label="Open profile menu"
                        aria-expanded={open}
                        className="flex h-9 w-9 items-center justify-center rounded-full bg-orange-500 text-sm font-bold text-white hover:bg-orange-600"
                    >
                        {session ? session.name.charAt(0).toUpperCase() : ""}
                    </button>

                    {open && session && (
                        <div className="absolute right-0 top-12 w-64 rounded-2xl border border-white/10 bg-[#0d1424] p-2 text-white shadow-2xl light:border-slate-200 light:bg-white light:text-slate-900">
                            <div className="flex items-center gap-3 border-b border-white/10 p-3 light:border-slate-200">
                                <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full bg-orange-500 font-bold text-white">
                                    {session.name.charAt(0).toUpperCase()}
                                </div>
                                <div className="min-w-0">
                                    <p className="truncate font-semibold">{session.name}</p>
                                    <p className="truncate text-xs">{session.email}</p>
                                    <span className="mt-1 inline-block rounded-full bg-orange-500/20 px-2 py-0.5 text-[11px] font-semibold capitalize text-orange-500">
                                        {session.role}
                                    </span>
                                </div>
                            </div>

                            {profileHref && <Link
                                href={profileHref}
                                onClick={() => setOpen(false)}
                                className="mt-1 flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium hover:bg-white/10 light:hover:bg-slate-100"
                            >
                                ⚙️ Profile & Settings
                            </Link>}
                            <button
                                type="button"
                                onClick={handleLogout}
                                className="flex w-full items-center gap-3 rounded-lg px-3 py-2.5 text-left text-sm font-medium text-red-500 hover:bg-red-500/10"
                            >
                                🚪 Logout
                            </button>
                        </div>
                    )}
                </div>
            </div>
        </header>
    );
}
