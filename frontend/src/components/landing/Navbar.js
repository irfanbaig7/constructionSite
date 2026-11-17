import Link from "next/link";
import ThemeToggle from "@/components/ThemeToggle";
import { text } from "@/lib/styles";

export default function Navbar() {
    return (
        <header className="sticky top-0 z-50 border-b border-white/10 bg-[#0a0f1c]/80 backdrop-blur light:border-slate-200 light:bg-white/80">
            <nav className="mx-auto flex max-w-6xl items-center justify-between px-4 py-3 sm:px-6 sm:py-4">
                <Link href="/" className="flex items-center gap-2 text-xl font-bold">
                    <span className="text-2xl text-orange-500">⌂</span> SiteProof
                </Link>

                <div className={`hidden items-center gap-8 text-sm md:flex ${text}`}>
                    <a href="#features" className="hover:text-orange-500">Features</a>
                    <a href="#how" className="hover:text-orange-500">How it works</a>
                </div>

                <div className="flex items-center gap-2 sm:gap-3">
                    <ThemeToggle />
                    <Link href="/login" className={`hidden text-sm hover:text-orange-500 sm:block ${text}`}>
                        Login
                    </Link>
                    <Link
                        href="/login"
                        className="whitespace-nowrap rounded-lg bg-orange-500 px-3 py-2 text-sm font-semibold text-white hover:bg-orange-600 sm:px-4"
                    >
                        Get Started
                    </Link>
                </div>
            </nav>
        </header>
    );
}