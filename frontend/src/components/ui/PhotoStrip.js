"use client";

import { useEffect, useState } from "react";
import { thumb, large } from "@/lib/cloudinary";

export default function PhotoStrip({ photos, size = "h-20 w-20" }) {
    const [index, setIndex] = useState(null);
    const count = photos.length;

    useEffect(() => {
        if (index === null) return;
        const onKey = (e) => {
            if (e.key === "Escape") setIndex(null);
            if (e.key === "ArrowRight") setIndex((i) => (i + 1) % count);
            if (e.key === "ArrowLeft") setIndex((i) => (i - 1 + count) % count);
        };
        document.addEventListener("keydown", onKey);
        return () => document.removeEventListener("keydown", onKey);
    }, [index, count]);

    if (count === 0) return <p className="text-sm">No photos.</p>;

    const nav = "absolute top-1/2 flex h-10 w-10 -translate-y-1/2 items-center justify-center rounded-full bg-white/15 text-2xl text-white hover:bg-white/30";

    return (
        <>
            <div className="flex flex-wrap gap-2">
                {photos.map((p, i) => (
                    <button key={p.url} type="button" onClick={() => setIndex(i)} aria-label={`Open photo ${i + 1}`}>
                        {/* eslint-disable-next-line @next/next/no-img-element */}
                        <img src={thumb(p.url)} alt={`Site photo ${i + 1}`} className={`${size} rounded-xl object-cover transition hover:opacity-80`} />
                    </button>
                ))}
            </div>

            {index !== null && (
                <div onClick={() => setIndex(null)} className="fixed inset-0 z-[80] flex items-center justify-center bg-black/85 p-4">
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img
                        src={large(photos[index].url)}
                        alt={`Site photo ${index + 1}`}
                        onClick={(e) => e.stopPropagation()}
                        className="max-h-[85vh] max-w-[90vw] rounded-xl object-contain"
                    />
                    <button type="button" aria-label="Close" onClick={() => setIndex(null)}
                        className="absolute right-4 top-4 flex h-10 w-10 items-center justify-center rounded-full bg-white/15 text-white hover:bg-white/30">✕</button>
                    {count > 1 && (
                        <>
                            <button type="button" aria-label="Previous" className={`${nav} left-4`}
                                onClick={(e) => { e.stopPropagation(); setIndex((index - 1 + count) % count); }}>‹</button>
                            <button type="button" aria-label="Next" className={`${nav} right-4`}
                                onClick={(e) => { e.stopPropagation(); setIndex((index + 1) % count); }}>›</button>
                            <p className="absolute bottom-4 text-sm text-white">{index + 1} / {count}</p>
                        </>
                    )}
                </div>
            )}
        </>
    );
}