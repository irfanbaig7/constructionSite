"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { notify } from "@/lib/notify";
import FormField from "./FormField";
import { login } from "@/services/authService";
import { dashboardFor } from "@/lib/routes";

export default function LoginForm() {
    const router = useRouter();
    const [form, setForm] = useState({ email: "", password: "" });
    const [loading, setLoading] = useState(false);

    const update = (e) => setForm((f) => ({ ...f, [e.target.name]: e.target.name === "email" ? e.target.value.replace(/\s/g, "") : e.target.value }));

    async function handleSubmit(e) {
        e.preventDefault();
        setLoading(true);
        try {
            const user = await login(form);
            setForm({ email: "", password: "" });
            router.push(dashboardFor(user.role));
        } catch (err) {
            console.log("LOGIN ERROR:", err.message);
            notify.error(err.message);
        } finally {
            setLoading(false);
        }
    }

    return (
        <form onSubmit={handleSubmit} className="space-y-4">
            <FormField label="Email" name="email" type="email" value={form.email} onChange={update} placeholder="you@example.com" autoComplete="email" />
            <FormField label="Password" name="password" type="password" value={form.password} onChange={update} placeholder="Your password" autoComplete="current-password" />
            <button type="submit" disabled={loading} className="w-full rounded-lg bg-orange-500 py-3 font-semibold text-white hover:bg-orange-600 disabled:opacity-60">
                {loading ? "Logging in..." : "Login →"}
            </button>
        </form>
    );
}
