"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import useSession from "@/hooks/useSession";
import { logout } from "@/services/authService";
import { ROUTES } from "@/lib/routes";
import { card } from "@/lib/styles";
import PageHeader from "@/components/ui/PageHeader";
import Field from "@/components/ui/Field";

function Section({ title, hint, children }) {
    return (
        <section className={`rounded-2xl p-5 sm:p-6 ${card}`}>
            <h2 className="text-lg font-bold">{title}</h2>
            {hint && <p className="mt-1 text-sm">{hint}</p>}
            <div className="mt-4">{children}</div>
        </section>
    );
}

function SaveButton({ saved }) {
    return (
        <div className="mt-4 flex items-center gap-3">
            <button type="submit" className="rounded-lg bg-orange-500 px-4 py-2.5 text-sm font-semibold text-white hover:bg-orange-600">
                Save changes
            </button>
            {saved && <span className="text-sm font-semibold text-green-500">✓ Saved</span>}
        </div>
    );
}

function Toggle({ label, text, checked, onChange }) {
    return (
        <li className="flex items-center justify-between gap-4 py-3">
            <div>
                <p className="font-semibold">{label}</p>
                <p className="text-xs">{text}</p>
            </div>
            <button
                type="button"
                role="switch"
                aria-checked={checked}
                onClick={onChange}
                className={`relative h-6 w-11 shrink-0 rounded-full transition ${checked ? "bg-orange-500" : "bg-slate-500/50"}`}
            >
                <span className={`absolute top-0.5 h-5 w-5 rounded-full bg-white transition-all ${checked ? "left-[22px]" : "left-0.5"}`} />
            </button>
        </li>
    );
}

function ProfileCard({ session }) {
    return (
        <section className={`flex items-center gap-4 rounded-2xl p-5 sm:p-6 ${card}`}>
            <div className="flex h-16 w-16 shrink-0 items-center justify-center rounded-full bg-orange-500 text-2xl font-bold text-white">
                {session.name.charAt(0).toUpperCase()}
            </div>
            <div className="min-w-0">
                <p className="truncate text-xl font-bold">{session.name}</p>
                <p className="truncate text-sm">{session.email}</p>
                <span className="mt-1 inline-block rounded-full bg-orange-500/20 px-2.5 py-0.5 text-xs font-semibold capitalize text-orange-500">
                    {session.role}
                </span>
            </div>
        </section>
    );
}

function ProfileForm({ session }) {
    const [form, setForm] = useState({ name: session.name, phone: "", company: "", gst: "", address: "" });
    const [saved, setSaved] = useState(false);
    const update = (e) => { setForm({ ...form, [e.target.name]: e.target.value }); setSaved(false); };

    return (
        <Section title="Profile & Business" hint="Ye details reports aur homeowner ko dikhengi.">
            <form onSubmit={(e) => { e.preventDefault(); setSaved(true); }}>
                <div className="grid gap-4 sm:grid-cols-2">
                    <Field label="Full name" name="name" value={form.name} onChange={update} required />
                    <Field label="Email" name="email" value={session.email} disabled readOnly />
                    <Field label="Phone" name="phone" type="tel" value={form.phone} onChange={update} placeholder="10 digit number" />
                    <Field label="Company / firm name" name="company" value={form.company} onChange={update} placeholder="e.g. Baig Constructions" />
                    <Field label="GST number (optional)" name="gst" value={form.gst} onChange={update} />
                    <Field label="Business address" name="address" value={form.address} onChange={update} />
                </div>
                <SaveButton saved={saved} />
            </form>
        </Section>
    );
}

function NotificationsForm() {
    const [prefs, setPrefs] = useState({ lowStock: true, payments: true, dailyReminder: true, milestone: false });
    const flip = (k) => setPrefs((p) => ({ ...p, [k]: !p[k] }));

    return (
        <Section title="Notifications">
            <ul className="divide-y divide-white/10 light:divide-slate-200">
                <Toggle label="Low stock alerts" text="Jab koi material minimum se neeche jaye" checked={prefs.lowStock} onChange={() => flip("lowStock")} />
                <Toggle label="Payment reminders" text="Pending payments ka reminder" checked={prefs.payments} onChange={() => flip("payments")} />
                <Toggle label="Daily update reminder" text="Shaam ko update post karne ka reminder" checked={prefs.dailyReminder} onChange={() => flip("dailyReminder")} />
                <Toggle label="Auto-notify homeowner on milestone" text="Milestone complete hone par homeowner ko alert" checked={prefs.milestone} onChange={() => flip("milestone")} />
            </ul>
        </Section>
    );
}

export default function SettingsView() {
    const router = useRouter();
    const session = useSession();

    function handleLogout() {
        logout();
        router.replace(ROUTES.login);
    }

    return (
        <div className="max-w-3xl space-y-6">
            <PageHeader title="Settings" subtitle="Manage your account and app preferences" />

            {session && <ProfileCard session={session} />}
            {session && <ProfileForm session={session} />}
            <NotificationsForm />

            <Section title="Account">
                <button
                    type="button"
                    onClick={handleLogout}
                    className="rounded-lg border border-red-500/50 px-4 py-2.5 text-sm font-semibold text-red-500 hover:bg-red-500/10"
                >
                    Logout
                </button>
            </Section>
        </div>
    );
}