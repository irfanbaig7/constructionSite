"use client";

import { useState, useSyncExternalStore } from "react";
import Link from "next/link";
import FormField from "./FormField";
import { forgotPassword, resetPassword, verifyEmail } from "@/services/authService";

const readHash = () => window.location.hash.slice(1);
const emptyHash = () => "";
const subscribe = (listener) => {
    window.addEventListener("hashchange", listener);
    return () => window.removeEventListener("hashchange", listener);
};

export default function AccountAccessForm() {
    const params = new URLSearchParams(useSyncExternalStore(subscribe, readHash, emptyHash));
    const token = params.get("token");
    const action = params.get("action");
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [busy, setBusy] = useState(false);
    const [error, setError] = useState("");
    const [success, setSuccess] = useState("");
    const title = action === "verify" ? "Verify email" : "Reset password";

    async function submit(event) {
        event.preventDefault();
        setBusy(true);
        setError("");
        try {
            if (action === "verify") {
                await verifyEmail(token);
                setSuccess("Email verified. You can now sign in and open your projects.");
            } else if (action === "reset") {
                await resetPassword(token, password);
                setSuccess("Password updated. Sign in with your new password.");
            } else {
                await forgotPassword(email);
                setSuccess("If an account exists for that email, you’ll receive a password reset link.");
            }
            if (token) window.history.replaceState(null, "", window.location.pathname);
            setPassword("");
        } catch (err) {
            setError(err.message);
        } finally {
            setBusy(false);
        }
    }

    return (
        <main className="mx-auto w-full max-w-md space-y-4 px-4 py-12">
            <h1 className="text-2xl font-bold">{title}</h1>
            {success ? <p role="status">{success}</p> : (
                <form onSubmit={submit} className="space-y-4">
                    {!action && <FormField label="Email" name="email" type="email" autoComplete="email" value={email} onChange={(e) => setEmail(e.target.value)} />}
                    {action === "reset" && <FormField label="New password" name="password" type="password" autoComplete="new-password" value={password} onChange={(e) => setPassword(e.target.value)} />}
                    {error && <p role="alert">{error}</p>}
                    <button type="submit" disabled={busy} className="rounded-lg bg-orange-600 px-4 py-2 font-semibold text-white disabled:opacity-60">
                        {busy ? "Please wait…" : action ? title : "Send reset link"}
                    </button>
                </form>
            )}
            <Link className="inline-block underline" href="/login">Back to login</Link>
        </main>
    );
}
