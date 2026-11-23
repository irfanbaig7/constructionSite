
"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import toast from "react-hot-toast";
import FormField from "./FormField";
import RoleSelector from "./RoleSelector";
import { signup } from "@/services/authService";
import { dashboardFor } from "@/lib/routes";

const empty = { name: "", email: "", password: "", role: "contractor" };

export default function SignupForm() {
    const router = useRouter();
    const [form, setForm] = useState(empty);
    const [loading, setLoading] = useState(false);

    const update = (e) => {
        const { name, value } = e.target;
        // passwords and emails never contain spaces, so they are removed as the user types or pastes
        setForm((f) => ({ ...f, [name]: name === "password" || name === "email" ? value.replace(/\s/g, "") : value }));
    };

    async function handleSubmit(e) {
        e.preventDefault();
        if (!form.name.trim()) return toast.error("Please enter your name.", { id: "auth-error" });
        if (form.password.length < 8) return toast.error("Password must be at least 8 characters long.", { id: "auth-error" });
        setLoading(true);
        try {
            const user = await signup({ ...form, name: form.name.trim() });
            setForm(empty);
            toast.success("Account created successfully!");
            router.push(dashboardFor(user.role));
        } catch (err) {
            toast.error(err.message, { id: "auth-error" });
        } finally {
            setLoading(false);
        }
    }

    return (
        <form onSubmit={handleSubmit} className="space-y-4">
            <FormField label="Full name" name="name" value={form.name} onChange={update} placeholder="Your name" autoComplete="name" />
            <FormField label="Email" name="email" type="email" value={form.email} onChange={update} placeholder="you@example.com" autoComplete="email" />
            <FormField label="Password" name="password" type="password" value={form.password} onChange={update} placeholder="At least 8 characters, no spaces" autoComplete="new-password" />
            <RoleSelector value={form.role} onChange={(role) => setForm((f) => ({ ...f, role }))} />

            <button type="submit" disabled={loading} className="w-full rounded-lg bg-orange-500 py-3 font-semibold text-white hover:bg-orange-600 disabled:opacity-60">
                {loading ? "Creating account..." : "Create Account →"}
            </button>
        </form>
    );
}
