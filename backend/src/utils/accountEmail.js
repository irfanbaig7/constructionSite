import { createHash, randomBytes } from "node:crypto";
import { env } from "../config/env.js";

export const tokenHash = (token) => createHash("sha256").update(token).digest("hex");
export const newAccountToken = () => randomBytes(32).toString("hex");

export async function sendAccountEmail(to, kind, token) {
    if (!env.RESEND_API_KEY || !env.AUTH_EMAIL_FROM) return false;
    const label = kind === "verify" ? "Verify your SiteProof email" : "Reset your SiteProof password";
    const link = new URL("/account-access", env.CLIENT_ORIGIN);
    link.hash = new URLSearchParams({ action: kind, token }).toString();
    try {
        const response = await fetch("https://api.resend.com/emails", {
            method: "POST",
            signal: AbortSignal.timeout(8_000),
            headers: { Authorization: `Bearer ${env.RESEND_API_KEY}`, "Content-Type": "application/json" },
            body: JSON.stringify({ from: env.AUTH_EMAIL_FROM, to: [to], subject: label, text: `${label}: ${link}\n\nThis link expires in 30 minutes.` }),
        });
        return response.ok;
    } catch {
        return false;
    }
}
