"use client";

import { useState } from "react";
import Sidebar from "./Sidebar";
import Topbar from "./Topbar";

export default function AppShell({ role, children }) {
    const [open, setOpen] = useState(false);

    return (
        <div className="min-h-screen bg-[#0a0f1c] text-white light:bg-slate-100 light:text-slate-900">
            <Sidebar role={role} open={open} onClose={() => setOpen(false)} />
            <div className="lg:pl-64">
                <Topbar onMenuClick={() => setOpen(true)} profileHref={role === "contractor" ? "/contractor/settings" : "/homeowner/profile"} />
                <main className="p-4 sm:p-6">{children}</main>
            </div>
        </div>
    );
}