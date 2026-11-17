import AuthShell from "@/components/auth/AuthShell";
import SignupForm from "@/components/auth/SignupForm";

export const metadata = { title: "Sign Up | SiteProof" };

export default function SignupPage() {
    return (
        <AuthShell mode="signup">
            <SignupForm />
        </AuthShell>
    );
}