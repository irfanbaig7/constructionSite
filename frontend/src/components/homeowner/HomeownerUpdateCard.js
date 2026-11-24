import Link from "next/link";
import { HardHat, PackageCheck, Truck } from "lucide-react";
import PhotoStrip from "@/components/ui/PhotoStrip";
import { card } from "@/lib/styles";
import { formatUpdateTime } from "@/lib/format";

export default function HomeownerUpdateCard({ update, latest = false }) {
    return (
        <article className={`rounded-2xl p-4 sm:p-5 ${card}`}>
            <div className="flex flex-wrap items-start justify-between gap-3">
                <div className="flex flex-wrap items-center gap-2">
                    <p className="font-bold">{formatUpdateTime(update.at)}</p>
                    {latest && <span className="rounded-full bg-green-500/15 px-2.5 py-1 text-xs font-semibold text-green-400 light:text-green-700">Latest</span>}
                </div>
                <p className="flex items-center gap-2 text-sm font-medium text-white/65 light:text-slate-600"><HardHat size={17} aria-hidden />{update.workers} workers present</p>
            </div>

            <p className="mt-3 text-base leading-7 sm:text-lg">{update.summary}</p>

            {update.materials.length > 0 && (
                <div className="mt-4 flex flex-wrap gap-2">
                    {update.materials.map((material) => (
                        <span key={material} className="inline-flex items-center gap-1.5 rounded-full border border-white/15 px-3 py-1.5 text-sm font-medium light:border-slate-300"><PackageCheck size={15} aria-hidden />{material}</span>
                    ))}
                </div>
            )}

            {update.deliveries?.length > 0 && (
                <div className="mt-4 flex items-start gap-2 text-sm font-semibold">
                    <Truck size={18} className="mt-0.5 shrink-0 text-blue-400 light:text-blue-700" aria-hidden />
                    <p>New material deliveries: {update.deliveries.map((delivery) => `${delivery.name} ${delivery.quantity} ${delivery.unit} (${delivery.by === "owner" ? "arranged by you" : "arranged by contractor"})`).join(", ")}</p>
                </div>
            )}

            <div className="mt-4 flex flex-col gap-4 border-t border-white/10 pt-4 light:border-slate-200 sm:flex-row sm:items-end sm:justify-between">
                <PhotoStrip photos={update.photos} size="h-20 w-20 sm:h-24 sm:w-24" />
                <Link href={`/homeowner/update/${update.id}`} className="inline-flex min-h-11 shrink-0 items-center justify-center rounded-xl border border-white/15 px-4 py-2.5 text-sm font-semibold transition hover:border-orange-500 hover:text-orange-500 light:border-slate-300">
                    View complete update
                </Link>
            </div>
        </article>
    );
}
