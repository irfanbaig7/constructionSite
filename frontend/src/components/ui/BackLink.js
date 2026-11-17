import Link from "next/link";

export default function BackLink({ href = "/contractor/dashboard", children = "← Back to Dashboard" }) {
    return (
        <Link href={href} className="text-sm font-medium hover:text-orange-500">
            {children}
        </Link>
    );
}