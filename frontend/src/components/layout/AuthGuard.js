"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { getSession } from "@/services/authService";
import { ROUTES, dashboardFor } from "@/lib/routes";

export default function AuthGuard({ role, children }) {
    const router = useRouter();
    const [allowed, setAllowed] = useState(false);

    useEffect(() => {
        const session = getSession();
        if (!session) {
            router.replace(ROUTES.login);
        } else if (session.role !== role) {
            router.replace(dashboardFor(session.role));
        } else {
            setAllowed(true);
        }
    }, [role, router]);

    if (!allowed) {
        return (
            <div className="flex min-h-screen items-center justify-center bg-[#0a0f1c] text-white light:bg-slate-100 light:text-slate-900">
                Loading...
            </div>
        );
    }

    return children;
}