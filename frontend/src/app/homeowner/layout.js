import AuthGuard from "@/components/layout/AuthGuard";
import HomeownerShell from "@/components/homeowner/HomeownerShell";

export default function HomeownerLayout({ children }) {
    return (
        <AuthGuard role="homeowner">
            <HomeownerShell>{children}</HomeownerShell>
        </AuthGuard>
    );
}