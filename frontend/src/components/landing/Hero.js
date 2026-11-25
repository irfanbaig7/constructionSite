import Link from "next/link";
import { text, card } from "@/lib/styles";

const stats = [
    ["Total Projects", "3"],
    ["In Progress", "2"],
    ["Completed", "1"],
    ["Total Spent", "₹2.4L"],
];

export default function Hero() {
    return (
        <section className="mx-auto grid max-w-6xl items-center gap-10 px-6 py-8 md:grid-cols-2 md:py-12">
            <div>
                <span className="rounded-full border border-orange-500/40 bg-orange-500/10 px-3 py-1 text-xs text-orange-500">
                    Construction Project Management
                </span>
                <h1 className="mt-5 text-4xl font-extrabold leading-tight sm:text-5xl md:text-6xl">
                    Build Smart.
                    <br />
                    <span className="text-orange-500">Stay Updated.</span>
                </h1>
                <p className={`mt-5 max-w-md text-lg ${text}`}>
                    One place for contractors and homeowners: daily work, materials and expenses, all backed by proof.
                </p>
                <ul className={`mt-5 space-y-3 ${text}`}>
                    {["Daily Work Updates", "Material Tracking", "Photo Proof"].map((t) => (
                        <li key={t} className="flex items-center gap-3">
                            <span className="h-2.5 w-2.5 rounded-full bg-orange-500" /> {t}
                        </li>
                    ))}
                </ul>
                <div className="mt-7 flex items-center gap-4">
                    <Link href="/login" className="rounded-lg bg-orange-500 px-6 py-3 font-semibold text-white hover:bg-orange-600">
                        Get Started →
                    </Link>
                    <a href="#features" className={`hover:text-orange-500 ${text}`}>Learn More ↓</a>
                </div>
            </div>

            {/* Dashboard preview card */}
            <div className={`rounded-2xl p-5 shadow-2xl ${card}`}>
                <p className={`text-sm ${text}`}>Daily updates 🏠</p>
                <div className="mt-4 grid grid-cols-2 gap-3">
                    {stats.map(([label, value]) => (
                        <div key={label} className="rounded-xl bg-white p-3 text-slate-900 light:bg-slate-100">
                            <p className="text-xs font-medium text-slate-700">{label}</p>
                            <p className="text-xl font-bold">{value}</p>
                        </div>
                    ))}
                </div>
                <div className="mt-4 rounded-xl bg-white p-4 text-slate-900 light:bg-slate-100">
                    <div className="flex items-center justify-between">
                        <div>
                            <p className="font-semibold">Sharma Residence</p>
                            <p className="text-xs text-slate-700">Pune, MH</p>
                        </div>
                        <span className="rounded-full bg-green-100 px-2 py-1 text-xs text-green-800">In Progress</span>
                    </div>
                    <div className="mt-3 h-2 rounded-full bg-slate-300">
                        <div className="h-2 w-[68%] rounded-full bg-blue-600" />
                    </div>
                    <p className="mt-1 text-right text-xs text-slate-700">68%</p>
                </div>
            </div>
        </section>
    );
}
