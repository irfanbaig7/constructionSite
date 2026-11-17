import Link from "next/link";
import Logo from "@/components/Logo";
import ThemeToggle from "@/components/ThemeToggle";
import { text, card } from "@/lib/styles";
import { ROUTES } from "@/lib/routes";

const tabs = [
    { key: "login", label: "Login", href: ROUTES.login },
    { key: "signup", label: "Sign Up", href: ROUTES.signup },
];

const titles = {
    login: { heading: "Welcome back", sub: "Login to see your projects." },
    signup: { heading: "Create your account", sub: "Start tracking your site in minutes." },
};

export default function AuthShell({ mode, children }) {
    return (
        <main className={`grid min-h-screen bg-[#0a0f1c] light:bg-slate-50 lg:grid-cols-2 ${text}`}>
            {/* Left branding panel */}
            <section className="relative hidden flex-col justify-between overflow-hidden border-r border-white/10 bg-gradient-to-br from-[#10182b] to-[#0a0f1c] p-12 light:border-slate-200 light:from-orange-50 light:to-white lg:flex">
                <Logo />
                <div>
                    <h1 className="text-5xl font-extrabold leading-tight">
                        Build Smart.
                        <br />
                        <span className="text-orange-500">Stay Updated.</span>
                    </h1>
                    <p className="mt-4 max-w-sm">
                        Daily work, materials and expenses, all in one place and backed by proof.
                    </p>
                </div>
                <p className="text-sm">Track. Update. Build Better.</p>
                <div className="pointer-events-none absolute -right-24 -top-24 h-72 w-72 rounded-full bg-orange-500/10 blur-3xl" />
            </section>

            {/* Right form panel */}
            <section className="relative flex items-center justify-center px-4 py-16 sm:px-6">
                <div className="absolute right-4 top-4">
                    <ThemeToggle />
                </div>

                <div className="w-full max-w-md">
                    <div className="mb-6 flex justify-center lg:hidden">
                        <Logo />
                    </div>

                    <div className={`rounded-2xl p-6 sm:p-8 ${card}`}>
                        <div className="grid grid-cols-2 border-b border-white/10 text-center text-sm font-semibold light:border-slate-200">
                            {tabs.map((tab) => (
                                <Link
                                    key={tab.key}
                                    href={tab.href}
                                    className={`border-b-2 pb-3 hover:text-orange-500 ${mode === tab.key ? "border-orange-500" : "border-transparent"
                                        }`}
                                >
                                    {tab.label}
                                </Link>
                            ))}
                        </div>

                        <h2 className="mt-6 text-2xl font-bold">{titles[mode].heading}</h2>
                        <p className="mt-1 text-sm">{titles[mode].sub}</p>

                        <div className="mt-6">{children}</div>
                    </div>
                </div>
            </section>
        </main>
    );
}