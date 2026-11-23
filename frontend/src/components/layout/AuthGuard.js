
"use client";

import { useCallback, useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { fetchSession } from "@/services/authService";
import { clearSession } from "@/lib/session";
import { ROUTES, dashboardFor } from "@/lib/routes";
import Realtime from "@/components/Realtime";

const screen = "flex min-h-screen flex-col items-center justify-center gap-3 bg-[#0a0f1c] text-white light:bg-slate-100 light:text-slate-900";

export default function AuthGuard({ role, children }) {
    const router = useRouter();
    const [state, setState] = useState("checking"); // checking | ok | offline

    const check = useCallback(() => {
        fetchSession()
            .then((user) => (user.role === role ? setState("ok") : router.replace(dashboardFor(user.role))))
            .catch((e) => {
                if (e.status === 401) {
                    clearSession();
                    router.replace(ROUTES.login);
                } else setState("offline");
            });
    }, [role, router]);

    useEffect(() => {
        check();
    }, [check]);

    if (state === "ok") return <><Realtime />{children}</>;
    if (state === "offline")
        return (
            <div className={screen}>
                <p>Unable to connect to the server.</p>
                <button type="button" onClick={() => { setState("checking"); check(); }}
                    className="rounded-lg bg-orange-500 px-4 py-2 text-sm font-semibold text-white hover:bg-orange-600">
                    Try Again
                </button>
            </div>
        );
    return <div className={screen}>Loading...</div>;
}
