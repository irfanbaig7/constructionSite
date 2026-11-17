import { steps } from "@/data/landing";
import { text } from "@/lib/styles";

export default function HowItWorks() {
    return (
        <section
            id="how"
            className="scroll-mt-20 border-y border-white/10 bg-white/[0.02] light:border-slate-200 light:bg-white"
        >
            <div className="mx-auto max-w-6xl px-6 py-16">
                <h2 className="text-center text-3xl font-bold md:text-4xl">How it works</h2>
                <div className="mt-10 grid gap-8 md:grid-cols-3">
                    {steps.map((s) => (
                        <div key={s.n} className="text-center">
                            <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-orange-500 text-lg font-bold text-white">
                                {s.n}
                            </div>
                            <h3 className="mt-4 text-lg font-semibold">{s.title}</h3>
                            <p className={`mt-2 text-sm ${text}`}>{s.text}</p>
                        </div>
                    ))}
                </div>
            </div>
        </section>
    );
}