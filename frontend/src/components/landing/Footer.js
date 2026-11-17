import { text } from "@/lib/styles";

export default function Footer() {
    return (
        <footer className={`border-t border-white/10 py-6 text-center text-sm light:border-slate-200 ${text}`}>
            © 2026 SiteProof. All rights reserved.
        </footer>
    );
}