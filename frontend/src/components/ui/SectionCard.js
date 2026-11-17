import Link from "next/link";
import { card } from "@/lib/styles";

export default function SectionCard({ title, href, children }) {
    return (
        <section className={`rounded-2xl p-5 ${card}`}>
            <div className="flex items-center justify-between">
                <h2 className="text-lg font-bold">{title}</h2>
                {href && (
                    <Link href={href} className="text-sm font-medium hover:text-orange-500">
                        View All →
                    </Link>
                )}
            </div>
            <div className="mt-4">{children}</div>
        </section>
    );
}