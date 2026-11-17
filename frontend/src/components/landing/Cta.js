import Link from "next/link";
import { text } from "@/lib/styles";

export default function Cta() {
    return (
        <section className="mx-auto max-w-4xl px-6 py-16 text-center">
            <h2 className="text-3xl font-bold md:text-4xl">Track. Update. Build Better.</h2>
            <p className={`mt-3 ${text}`}>Start your first project today.</p>
            <Link
                href="/login"
                className="mt-8 inline-block rounded-lg bg-orange-500 px-8 py-3 font-semibold text-white hover:bg-orange-600"
            >
                Get Started Free →
            </Link>
        </section>
    );
}