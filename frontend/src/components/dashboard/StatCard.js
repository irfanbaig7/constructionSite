import Link from "next/link";
import { card } from "@/lib/styles";

const tones = {
    blue: "bg-blue-500/20",
    orange: "bg-orange-500/20",
    green: "bg-green-500/20",
    purple: "bg-purple-500/20",
};

export default function StatCard({ label, value, icon, tone, href, hint }) {
    const base = `flex items-center gap-4 rounded-2xl p-4 ${card}`;

    const content = (
        <>
            <div className={`flex h-12 w-12 items-center justify-center rounded-xl text-2xl ${tones[tone]}`}>
                {icon}
            </div>
            <div>
                <p className="text-sm">{label}</p>
                <p className="text-2xl font-bold">{value}</p>
                {hint && <p className="text-xs font-medium">{hint}</p>}
            </div>
        </>
    );

    if (href) {
        return (
            <Link href={href} className={`${base} transition hover:border-orange-500/60`}>
                {content}
            </Link>
        );
    }
    return <div className={base}>{content}</div>;
}