"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import FormField from "./FormField";
import RoleSelector from "./RoleSelector";
import { signup } from "@/services/authService";
import { dashboardFor } from "@/lib/routes";

export default function SignupForm() {
    const router = useRouter();
    const [form, setForm] = useState({ name: "", email: "", password: "", role: "contractor" });
    const [error, setError] = useState("");
    const [loading, setLoading] = useState(false);

    const update = (e) => setForm({ ...form, [e.target.name]: e.target.value });

    async function handleSubmit(e) {
        e.preventDefault();
        setError("");
        if (form.password.length < 6) {
            setError("Password must be at least 6 characters.");
            return;
        }
        setLoading(true);
        try {
            const user = await signup(form);
            setForm({ name: "", email: "", password: "", role: "contractor" });
            router.push(dashboardFor(user.role));
        } catch (err) {
            setError(err.message);
        } finally {
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

            <FormField label="Full name" name="name" value={form.name} onChange={update} placeholder="Your name" autoComplete="name" />
            <FormField label="Email" name="email" type="email" value={form.email} onChange={update} placeholder="you@example.com" autoComplete="email" />
            <FormField label="Password" name="password" type="password" value={form.password} onChange={update} placeholder="At least 6 characters" autoComplete="new-password" />
            <RoleSelector value={form.role} onChange={(role) => setForm({ ...form, role })} />

            <button
                type="submit"
                disabled={loading}
                className="w-full rounded-lg bg-orange-500 py-3 font-semibold text-white hover:bg-orange-600 disabled:opacity-60"
            >
                {loading ? "Creating account..." : "Create Account →"}
            </button>
        </form>
    );
}