import Link from "next/link";

export default function Logo({ className = "", href = "/" }) {
    return (
        <Link href={href} className={`flex items-center gap-2 text-xl font-bold ${className}`}>
            <span className="text-2xl text-orange-500">⌂</span> SiteProof
        </Link>
    );
}
