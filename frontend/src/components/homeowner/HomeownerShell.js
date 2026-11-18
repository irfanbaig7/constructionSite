"use client";

import Topbar from "@/components/layout/Topbar";

export default function HomeownerShell({ children }) {
    return (
        <div className="min-h-screen bg-[#0a0f1c] text-white light:bg-slate-100 light:text-slate-900">
            <Topbar />
            <main className="mx-auto max-w-5xl p-4 sm:p-6">{children}</main>
        </div>
    );
}