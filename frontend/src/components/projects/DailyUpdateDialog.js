"use client";

import { useEffect, useState } from "react";
import Modal from "@/components/ui/Modal";
import Field from "@/components/ui/Field";
import { getWorkers } from "@/services/workerService";
import { getTodayAttendance } from "@/services/attendanceService";
import { addUpdate } from "@/services/projectService";
import { compressImage } from "@/lib/image";

const MAX_PHOTOS = 6;

export default function DailyUpdateDialog({ projectId, onClose, onSaved }) {
    const [workers, setWorkers] = useState([]);
    const [selected, setSelected] = useState([]);
    const [photos, setPhotos] = useState([]);
    const [summary, setSummary] = useState("");
    const [materials, setMaterials] = useState("");
    const [query, setQuery] = useState("");
    const [error, setError] = useState("");
    const [busy, setBusy] = useState(false);

    useEffect(() => {
        Promise.all([getWorkers(), getTodayAttendance()]).then(([w, a]) => {
            setWorkers(w);
            setSelected(a[projectId] ?? []); // today's assigned workers come pre-ticked
        });
    }, [projectId]);

    const toggle = (id) => setSelected((s) => (s.includes(id) ? s.filter((x) => x !== id) : [...s, id]));

    async function pick(e) {
        const files = Array.from(e.target.files).slice(0, MAX_PHOTOS - photos.length);
        e.target.value = "";
        try {
            const urls = await Promise.all(files.map((f) => compressImage(f)));
            setPhotos((p) => [...p, ...urls]);
        } catch {
            setError("Could not read one of the photos.");
        }
    }

    async function submit(e) {
        e.preventDefault();
        setError("");
        if (photos.length === 0) return setError("Add at least 1 photo as proof.");
        if (selected.length === 0) return setError("Tick at least 1 worker who was present.");
        setBusy(true);
        try {
            await addUpdate(projectId, { summary, workerIds: selected, photos, materials });
            onSaved();
            onClose();
        } catch {
            setBusy(false);
            setError("Storage is full. Remove some photos and try again.");
        }
    }

    const q = query.trim().toLowerCase();
    const shown = workers.filter((w) => w.name.toLowerCase().includes(q));

    return (
        <Modal title="Add daily update" onClose={onClose}>
            <form onSubmit={submit} className="space-y-4">
                {error && (
                    <p className="rounded-lg border border-red-500/40 bg-red-500/10 px-3 py-2 text-sm text-red-500">{error}</p>
                )}

                <Field label="What work was done today?" name="summary" as="textarea" rows={3} required
                    value={summary} onChange={(e) => setSummary(e.target.value)} placeholder="e.g. Slab shuttering completed" />

                <div>
                    <p className="mb-1.5 text-sm font-medium">Photos ({photos.length}/{MAX_PHOTOS})</p>
                    <div className="flex flex-wrap gap-2">
                        {photos.map((src, i) => (
                            <div key={i} className="relative h-20 w-20">
                                {/* eslint-disable-next-line @next/next/no-img-element */}
                                <img src={src} alt={`Photo ${i + 1}`} className="h-20 w-20 rounded-lg object-cover" />
                                <button
                                    type="button"
                                    aria-label="Remove photo"
                                    onClick={() => setPhotos((p) => p.filter((_, j) => j !== i))}
                                    className="absolute -right-1 -top-1 flex h-5 w-5 items-center justify-center rounded-full bg-red-500 text-xs text-white"
                                >
                                    ✕
                                </button>
                            </div>
                        ))}
                        {photos.length < MAX_PHOTOS && (
                            <label className="flex h-20 w-20 cursor-pointer flex-col items-center justify-center rounded-lg border border-dashed border-white/30 text-xs hover:border-orange-500 light:border-slate-400">
                                <span className="text-2xl">📷</span>
                                Add
                                <input type="file" accept="image/*" multiple onChange={pick} className="hidden" />
                            </label>
                        )}
                    </div>
                </div>

                <div>
                    <p className="mb-1.5 text-sm font-medium">Workers present ({selected.length} selected)</p>
                    <input
                        type="search"
                        value={query}
                        onChange={(e) => setQuery(e.target.value)}
                        placeholder="Search worker"
                        className="mb-2 w-full rounded-lg border border-white/15 bg-white/5 px-3 py-2 text-sm outline-none focus:border-orange-500 light:border-slate-300 light:bg-white"
                    />
                    <ul className="grid max-h-48 gap-1 overflow-y-auto rounded-lg border border-white/10 p-2 sm:grid-cols-2 light:border-slate-200">
                        {shown.map((w) => (
                            <li key={w.id}>
                                <label className="flex cursor-pointer items-center gap-2 rounded-md px-2 py-1.5 text-sm hover:bg-white/10 light:hover:bg-slate-100">
                                    <input type="checkbox" checked={selected.includes(w.id)} onChange={() => toggle(w.id)} className="accent-orange-500" />
                                    {w.name}
                                </label>
                            </li>
                        ))}
                        {shown.length === 0 && <li className="px-2 py-1.5 text-sm">No workers found.</li>}
                    </ul>
                </div>

                <Field label="Materials used (optional, comma separated)" name="materials"
                    value={materials} onChange={(e) => setMaterials(e.target.value)} placeholder="Cement 50 bags, Steel 400 kg" />

                <div className="flex gap-3">
                    <button type="submit" disabled={busy} className="rounded-lg bg-orange-500 px-4 py-2.5 text-sm font-semibold text-white hover:bg-orange-600 disabled:opacity-60">
                        {busy ? "Saving..." : "Post update"}
                    </button>
                    <button type="button" onClick={onClose} className="rounded-lg border border-white/15 px-4 py-2.5 text-sm font-semibold hover:border-orange-500 light:border-slate-300">
                        Cancel
                    </button>
                </div>
            </form>
        </Modal>
    );
}