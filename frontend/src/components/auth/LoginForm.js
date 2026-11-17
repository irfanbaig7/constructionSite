"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import FormField from "./FormField";
import { login } from "@/services/authService";
import { dashboardFor } from "@/lib/routes";

const demos = [
    { label: "Use contractor demo", email: "contractor@siteproof.com", password: "contractor123" },
    { label: "Use homeowner demo", email: "homeowner@siteproof.com", password: "homeowner123" },
];

export default function LoginForm() {
    const router = useRouter();
    const [form, setForm] = useState({ email: "", password: "" });
    const [error, setError] = useState("");
    const [loading, setLoading] = useState(false);

    const update = (e) => setForm({ ...form, [e.target.name]: e.target.value });

    async function handleSubmit(e) {
        e.preventDefault();
        setError("");
        setLoading(true);
        try {
            const user = await login(form);
            router.push(dashboardFor(user.role));
        } catch (err) {
            setError(err.message);
            setLoading(false);
        }
    }

    return (
        <form onSubmit={handleSubmit} className="space-y-4">
            {error && (
                <p className="rounded-lg border border-red-500/40 bg-red-500/10 px-3 py-2 text-sm text-red-500">
                    {error}
                </p>
            )}

            <FormField label="Email" name="email" type="email" value={form.email} onChange={update} placeholder="you@example.com" autoComplete="email" />
            <FormField label="Password" name="password" type="password" value={form.password} onChange={update} placeholder="Your password" autoComplete="current-password" />

            <button
                type="submit"
                disabled={loading}
                className="w-full rounded-lg bg-orange-500 py-3 font-semibold text-white hover:bg-orange-600 disabled:opacity-60"
            >
                {loading ? "Logging in..." : "Login →"}
            </button>

            <div className="flex flex-wrap gap-2 pt-1">
                {demos.map((d) => (
                    <button
                        key={d.label}
                        type="button"
                        onClick={() => setForm({ email: d.email, password: d.password })}
                        className="rounded-md border border-white/15 px-3 py-1.5 text-xs font-medium hover:border-orange-500 hover:text-orange-500 light:border-slate-300"
                    >
                        {d.label}
                    </button>
                ))}
            </div>
        </form>
    );
}