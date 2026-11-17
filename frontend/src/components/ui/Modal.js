"use client";

import { useEffect } from "react";

export default function Modal({ title, onClose, children }) {
    useEffect(() => {
        const onKey = (e) => e.key === "Escape" && onClose();
        document.addEventListener("keydown", onKey);
        return () => document.removeEventListener("keydown", onKey);
    }, [onClose]);

    return (
        <div
            onMouseDown={onClose}
            className="fixed inset-0 z-[60] flex items-end justify-center bg-black/60 p-4 sm:items-center"
        >
            <div
                onMouseDown={(e) => e.stopPropagation()}
                className="max-h-[90vh] w-full max-w-lg overflow-y-auto rounded-2xl border border-white/10 bg-[#0d1424] p-5 text-white shadow-2xl light:border-slate-200 light:bg-white light:text-slate-900"
            >
                <div className="flex items-center justify-between gap-3">
                    <h2 className="text-lg font-bold">{title}</h2>
                    <button
                        type="button"
                        onClick={onClose}
                        aria-label="Close"
                        className="flex h-8 w-8 items-center justify-center rounded-lg hover:bg-white/10 light:hover:bg-slate-100"
                    >
                        ✕
                    </button>
                </div>
                <div className="mt-4">{children}</div>
            </div>
        </div>
    );
}