"use client";

import { useState } from "react";
import Link from "next/link";
import PageHeader from "@/components/ui/PageHeader";
import BackLink from "@/components/ui/BackLink";
import Field from "@/components/ui/Field";
import { card, inputClass } from "@/lib/styles";
import { formatINRFull } from "@/lib/money";
import { formatDate } from "@/lib/date";
import { createProject } from "@/services/projectService";

const types = [
    "Residential House",
    "Residential Villa",
    "Commercial Building",
    "Commercial Renovation",
    "Boundary Wall / Plot",
    "Other",
];

const presetMilestones = ["Excavation", "Foundation", "Plinth", "Slab casting", "Ground Floor", "First Floor", "Finishing"];

const empty = {
    name: "", owner: "", ownerPhone: "", ownerEmail: "", location: "",
    type: types[0], area: "", rooms: "", budget: "", advance: "",
    startDate: "", expectedEnd: "", notes: "",
};

function MilestonePicker({ options, selected, onToggle, onAdd }) {
    const [custom, setCustom] = useState("");

    function add() {
        const name = custom.trim();
        if (name) onAdd(name);
        setCustom("");
    }

    return (
        <div className="sm:col-span-2">
            <p className="mb-1.5 text-sm font-medium">Milestones (optional)</p>
            <div className="flex flex-wrap gap-2">
                {options.map((m) => {
                    const on = selected.includes(m);
                    return (
                        <button
                            key={m}
                            type="button"
                            aria-pressed={on}
                            onClick={() => onToggle(m)}
                            className={`rounded-full border px-3 py-1.5 text-xs font-semibold transition ${on
                                ? "border-orange-500 bg-orange-500/10 text-orange-500"
                                : "border-white/15 hover:border-orange-500 light:border-slate-300"
                                }`}
                        >
                            {on ? "✓ " : "+ "}{m}
                        </button>
                    );
                })}
            </div>
            <div className="mt-3 flex gap-2">
                <input
                    value={custom}
                    onChange={(e) => setCustom(e.target.value)}
                    onKeyDown={(e) => { if (e.key === "Enter") { e.preventDefault(); add(); } }}
                    placeholder="Add your own milestone"
                    className={inputClass}
                />
                <button
                    type="button"
                    onClick={add}
                    className="shrink-0 rounded-lg border border-white/15 px-4 text-sm font-semibold hover:border-orange-500 light:border-slate-300"
                >
                    Add
                </button>
            </div>
        </div>
    );
}

export default function NewProjectView() {
    const [form, setForm] = useState(empty);
    const [options, setOptions] = useState(presetMilestones);
    const [selected, setSelected] = useState(["Foundation", "Ground Floor", "First Floor", "Finishing"]);
    const [error, setError] = useState("");
    const [saved, setSaved] = useState(null);
    const [saving, setSaving] = useState(false);

    const update = (e) => setForm({ ...form, [e.target.name]: e.target.value });

    const toggle = (m) => setSelected((s) => (s.includes(m) ? s.filter((x) => x !== m) : [...s, m]));
    const addCustom = (name) => {
        if (!options.some((o) => o.toLowerCase() === name.toLowerCase())) setOptions((o) => [...o, name]);
        setSelected((s) => (s.includes(name) ? s : [...s, name]));
    };

    async function handleSubmit(e) {
        e.preventDefault();
        setError("");
        const budget = Number(form.budget);
        const advance = form.advance === "" ? 0 : Number(form.advance);

        if (!(budget > 0)) return setError("Budget must be more than 0.");
        if (advance < 0 || advance > budget) return setError("Advance must be between 0 and the budget.");
        if (form.expectedEnd <= form.startDate) return setError("Expected end date must be after the start date.");
        if (!/^\d{10}$/.test(form.ownerPhone.replace(/\s/g, ""))) return setError("Enter a 10 digit phone number.");

        setSaving(true);
        try {
            const milestones = options.filter((o) => selected.includes(o));
            await createProject({ ...form, budget, advance, milestones });
            setSaved({ ...form, budget, advance, milestones });
        } catch (err) {
            setError(err.message);
        } finally {
            setSaving(false);
        }
    }

    function reset() {
        setForm(empty);
        setOptions(presetMilestones);
        setSelected(["Foundation", "Ground Floor", "First Floor", "Finishing"]);
        setSaved(null);
    }

    if (saved) {
        const rows = [
            ["Owner", `${saved.owner} (${saved.ownerPhone})`],
            ["Owner email", saved.ownerEmail],
            ["Location", saved.location],
            ["Type", saved.type],
            ["Area / Rooms", `${saved.area || "-"} • ${saved.rooms || "-"}`],
            ["Budget", formatINRFull(saved.budget)],
            ["Advance received", saved.advance ? formatINRFull(saved.advance) : "-"],
            ["Dates", `${formatDate(saved.startDate)} → ${formatDate(saved.expectedEnd)}`],
            ["Milestones", saved.milestones.join(" → ") || "-"],
            ["Notes", saved.notes || "-"],
        ];
        return (
            <div className="space-y-6">
                <PageHeader title="Project created ✅" subtitle={saved.name} />
                <p className="text-sm">Demo mode: This data has not been saved, so it will not appear in the projects list.</p>
                <dl className={`grid gap-4 rounded-2xl p-5 sm:grid-cols-2 ${card}`}>
                    {rows.map(([k, v]) => (
                        <div key={k}>
                            <dt className="text-xs font-medium">{k}</dt>
                            <dd className="font-semibold">{v}</dd>
                        </div>
                    ))}
                </dl>
                <div className="flex gap-3">
                    <button type="button" onClick={reset} className="rounded-lg bg-orange-500 px-4 py-2.5 text-sm font-semibold text-white hover:bg-orange-600">
                        + Add another
                    </button>
                    <Link href="/contractor/projects" className="rounded-lg border border-white/15 px-4 py-2.5 text-sm font-semibold hover:border-orange-500 light:border-slate-300">
                        Back to Projects
                    </Link>
                </div>
            </div>
        );
    }

    return (
        <div className="space-y-6">
            <BackLink />
            <PageHeader title="New Project" subtitle="Fill in the details to start a new site. Fields marked (optional) can be skipped." />

            <form onSubmit={handleSubmit} className={`space-y-6 rounded-2xl p-5 sm:p-6 ${card}`}>
                {error && (
                    <p className="rounded-lg border border-red-500/40 bg-red-500/10 px-3 py-2 text-sm text-red-500">{error}</p>
                )}

                <div className="grid gap-4 sm:grid-cols-2">
                    <Field label="Project name" name="name" value={form.name} onChange={update} placeholder="e.g. Baig Residence" required className="sm:col-span-2" />
                    <Field label="Homeowner name" name="owner" value={form.owner} onChange={update} placeholder="Owner's full name" required />
                    <Field label="Homeowner phone" name="ownerPhone" type="tel" value={form.ownerPhone} onChange={update} placeholder="10 digit number" required />
                    <Field label="Homeowner email" name="ownerEmail" type="email" value={form.ownerEmail} onChange={update} placeholder="owner@example.com" required className="sm:col-span-2" />
                    <Field label="Location" name="location" value={form.location} onChange={update} placeholder="Area, City" required className="sm:col-span-2" />
                    <Field label="Project type" name="type" as="select" value={form.type} onChange={update}>
                        {types.map((t) => <option key={t} value={t}>{t}</option>)}
                    </Field>
                    <Field label="Budget (₹)" name="budget" type="number" min="1" value={form.budget} onChange={update} placeholder="1500000" required />
                    <Field label="Advance received (₹) (optional)" name="advance" type="number" min="0" value={form.advance} onChange={update} placeholder="0" className="sm:col-span-2" />
                    <Field label="Area (optional)" name="area" value={form.area} onChange={update} placeholder="1200 sq ft" />
                    <Field label="Rooms (optional)" name="rooms" value={form.rooms} onChange={update} placeholder="3 BHK" />
                    <Field label="Start date" name="startDate" type="date" value={form.startDate} onChange={update} required />
                    <Field label="Expected end date" name="expectedEnd" type="date" value={form.expectedEnd} onChange={update} required />
                    <MilestonePicker options={options} selected={selected} onToggle={toggle} onAdd={addCustom} />
                    <Field label="Notes (optional)" name="notes" as="textarea" rows={3} value={form.notes} onChange={update} placeholder="Anything important about this site" className="sm:col-span-2" />
                </div>

                <div className="flex gap-3">
                    <button type="submit" className="rounded-lg bg-orange-500 px-5 py-3 text-sm font-semibold text-white hover:bg-orange-600">
                        Create Project →
                    </button>
                    <Link href="/contractor/projects" className="rounded-lg border border-white/15 px-5 py-3 text-sm font-semibold hover:border-orange-500 light:border-slate-300">
                        Cancel
                    </Link>
                </div>
            </form>
        </div>
    );
}