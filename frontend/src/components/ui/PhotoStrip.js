"use client";

import { useEffect, useState } from "react";
import { thumb, large } from "@/lib/cloudinary";

export default function PhotoStrip({ photos, size = "h-20 w-20", featured = false }) {
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
            {featured ? (
                <div className="space-y-3">
                    <button
                        type="button"
                        onClick={() => setIndex(0)}
                        aria-label="Open primary site photo"
                        className="group relative block aspect-[4/3] w-full overflow-hidden rounded-2xl bg-black/30 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-orange-500"
                    >
                        {/* eslint-disable-next-line @next/next/no-img-element */}
                        <img src={large(photos[0].url)} alt="Primary site proof" className="h-full w-full object-contain transition duration-300 group-hover:scale-[1.01]" />
                        <span className="absolute bottom-3 right-3 rounded-xl bg-black/65 px-3 py-2 text-sm font-semibold text-white backdrop-blur">
                            View photo · {count} {count === 1 ? "photo" : "photos"}
                        </span>
                    </button>
                    {count > 1 && (
                        <div className="flex gap-2 overflow-x-auto pb-1">
                            {photos.slice(1).map((p, i) => (
                                <button key={p.url} type="button" onClick={() => setIndex(i + 1)} aria-label={`Open photo ${i + 2}`} className="shrink-0 rounded-xl focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-orange-500">
                                    {/* eslint-disable-next-line @next/next/no-img-element */}
                                    <img src={thumb(p.url)} alt={`Site proof ${i + 2}`} className="h-16 w-16 rounded-xl object-cover transition hover:opacity-80 sm:h-20 sm:w-20" />
                                </button>
                            ))}
                        </div>
                    )}
                </div>
            ) : (
                <div className="flex flex-wrap gap-2">
                    {photos.map((p, i) => (
                        <button key={p.url} type="button" onClick={() => setIndex(i)} aria-label={`Open photo ${i + 1}`}>
                            {/* eslint-disable-next-line @next/next/no-img-element */}
                            <img src={thumb(p.url)} alt={`Site photo ${i + 1}`} className={`${size} rounded-xl object-cover transition hover:opacity-80`} />
                        </button>
                    ))}
                </div>
            )}

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
