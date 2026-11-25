
"use client";

import { useCallback, useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { fetchSession, sendVerification, logout } from "@/services/authService";
import { clearSession } from "@/lib/session";
import { ROUTES, dashboardFor } from "@/lib/routes";
import Realtime from "@/components/Realtime";

const screen = "flex min-h-screen flex-col items-center justify-center gap-3 bg-[#0a0f1c] text-white light:bg-slate-100 light:text-slate-900";

export default function AuthGuard({ role, children }) {
    const router = useRouter();
    const [state, setState] = useState("checking"); // checking | ok | offline
    const [sending, setSending] = useState(false);
    const [message, setMessage] = useState("");

    const check = useCallback(() => {
        fetchSession()
            .then((user) => {
                if (user.role !== role) return router.replace(dashboardFor(user.role));
                setState(role === "homeowner" && !user.emailVerified ? "verify" : "ok");
            })
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
    if (state === "verify") return (
        <div className={`${screen} px-4 text-center`}>
            <h1 className="text-2xl font-bold">Verify your email</h1>
            <p>Confirm your email address to see linked projects.</p>
            <button type="button" disabled={sending} className="rounded-lg bg-orange-600 px-4 py-2 font-semibold text-white disabled:opacity-60"
                onClick={async () => {
                    setSending(true);
                    try {
                        await sendVerification();
                        setMessage("Check your inbox for the verification link.");
                    } catch (error) {
                        setMessage(error.message);
                    } finally {
                        setSending(false);
                    }
                }}>
                {sending ? "Sending…" : "Send verification email"}
            </button>
            {message && <p role="status">{message}</p>}
            <button type="button" className="underline" onClick={check}>I’ve verified my email</button>
            <button type="button" className="underline" onClick={async () => {
                try {
                    await logout();
                    router.replace(ROUTES.login);
                } catch (error) {
                    setMessage(error.message);
                }
            }}>Log out</button>
        </div>
    );
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
