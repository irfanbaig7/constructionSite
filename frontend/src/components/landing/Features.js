import { features } from "@/data/landing";
import { text, card } from "@/lib/styles";

export default function Features() {
    return (
        <section id="features" className="mx-auto max-w-6xl scroll-mt-20 px-6 py-16">
            <h2 className="text-center text-3xl font-bold md:text-4xl">Everything in one app</h2>
            <p className={`mx-auto mt-3 max-w-xl text-center ${text}`}>
                No more WhatsApp chaos and handwritten notebooks. Complete proof of work in one place.
            </p>
            <div className="mt-10 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
                {features.map((f) => (
                    <div key={f.title} className={`rounded-2xl p-6 transition hover:border-orange-500/60 ${card}`}>
                        <div className="text-3xl">{f.icon}</div>
                        <h3 className="mt-4 text-lg font-semibold">{f.title}</h3>
                        <p className={`mt-2 text-sm ${text}`}>{f.text}</p>
                    </div>
                ))}
            </div>
        </section>
    );
}