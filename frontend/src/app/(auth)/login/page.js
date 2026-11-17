import AuthShell from "@/components/auth/AuthShell";
import LoginForm from "@/components/auth/LoginForm";

export const metadata = { title: "Login | SiteProof" };

export default function LoginPage() {
    return (
        <AuthShell mode="login">
            <LoginForm />
        </AuthShell>
    );
}