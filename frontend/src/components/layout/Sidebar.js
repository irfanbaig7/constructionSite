"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import Logo from "@/components/Logo";
import useSession from "@/hooks/useSession";
import { navigation } from "@/config/navigation";
import { dashboardFor } from "@/lib/routes";

export default function Sidebar({ role, open, onClose }) {
    const pathname = usePathname();
    const session = useSession();
    const items = navigation[role];

    return (
        <>
            {/* Dark overlay behind the sidebar on mobile */}
            {open && <div onClick={onClose} className="fixed inset-0 z-40 bg-black/50 lg:hidden" />}

            <aside
                className={`fixed inset-y-0 left-0 z-50 flex w-64 flex-col border-r border-white/10 bg-[#0d1424] p-4 text-white transition-transform light:border-slate-200 light:bg-white light:text-slate-900 lg:translate-x-0 ${open ? "translate-x-0" : "-translate-x-full"
                    }`}
            >
                <div className="px-2 py-3">
                    <Logo href={dashboardFor(role)} />
                </div>

                <nav className="mt-4 flex-1 space-y-1">
                    {items.map((item) => {
                        const active =
                            (pathname === item.href || pathname.startsWith(`${item.href}/`)) &&
                            !item.excludes?.some((p) => pathname.startsWith(p));
                        return (
                            <Link
                                key={item.href}
                                href={item.href}
                                onClick={onClose}
                                className={`flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition ${active
                                    ? "bg-orange-500 text-white light:text-white"
                                    : "hover:bg-white/10 light:hover:bg-slate-100"
                                    }`}
                            >
                                <span className="text-base">{item.icon}</span>
                                {item.label}
                            </Link>
                        );
                    })}
                </nav>

                {session && (
                    <div className="flex items-center gap-3 rounded-lg border border-white/10 p-3 light:border-slate-200">
                        <div className="flex h-9 w-9 items-center justify-center rounded-full bg-orange-500 text-sm font-bold text-white">
                            {session.name.charAt(0).toUpperCase()}
                        </div>
                        <div className="min-w-0">
                            <p className="truncate text-sm font-semibold">{session.name}</p>
                            <p className="text-xs capitalize">{session.role}</p>
                        </div>
                    </div>
                )}
            </aside>
        </>
    );
}
