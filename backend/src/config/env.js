
import "dotenv/config";
import { z } from "zod";

const schema = z.object({
    NODE_ENV: z.enum(["development", "production", "test"]).default("development"),
    PORT: z.coerce.number().default(5000),
    MONGODB_URI: z.string().min(1, "MONGODB_URI is required"),
    JWT_SECRET: z.string().min(32, "JWT_SECRET must be at least 32 characters long"),
    CLIENT_ORIGIN: z.url({ protocol: /^https?$/ }).transform((url) => new URL(url).origin).default("http://localhost:3000"),
    PUBLIC_API_URL: z.string().optional(),
    RAZORPAY_KEY_ID: z.string().optional(),
    RAZORPAY_KEY_SECRET: z.string().optional(),
    RAZORPAY_WEBHOOK_SECRET: z.string().optional(),
    RESEND_API_KEY: z.string().optional(),
    AUTH_EMAIL_FROM: z.string().optional(),
    CLOUDINARY_CLOUD_NAME: z.string().optional(),
    CLOUDINARY_API_KEY: z.string().optional(),
    CLOUDINARY_API_SECRET: z.string().optional(),
});

export function productionConfigErrors(config) {
    if (config.NODE_ENV !== "production") return [];
    const required = [
        "PUBLIC_API_URL", "RESEND_API_KEY", "AUTH_EMAIL_FROM", "CLOUDINARY_CLOUD_NAME",
        "CLOUDINARY_API_KEY", "CLOUDINARY_API_SECRET", "RAZORPAY_KEY_ID", "RAZORPAY_KEY_SECRET",
        "RAZORPAY_WEBHOOK_SECRET",
    ];
    const errors = required.filter((key) => !config[key]?.trim()).map((key) => `${key} is required`);
    if (!config.CLIENT_ORIGIN.startsWith("https://")) errors.push("CLIENT_ORIGIN must use HTTPS");
    if (config.PUBLIC_API_URL) {
        const url = URL.parse(config.PUBLIC_API_URL);
        if (!url || url.protocol !== "https:" || url.href !== `${url.origin}/`)
            errors.push("PUBLIC_API_URL must be an HTTPS origin without an API path");
    }
    if (config.RAZORPAY_KEY_ID && !config.RAZORPAY_KEY_ID.startsWith("rzp_test_"))
        errors.push("RAZORPAY_KEY_ID must be a test-mode key");
    return errors;
}

const parsed = schema.safeParse(process.env);
if (!parsed.success) {
    console.error("Invalid .env:\n" + parsed.error.issues.map((i) => `- ${i.path.join(".")}: ${i.message}`).join("\n"));
    process.exit(1);
}

const productionErrors = productionConfigErrors(parsed.data);
if (productionErrors.length) {
    console.error("Invalid production configuration:\n" + productionErrors.map((message) => `- ${message}`).join("\n"));
    process.exit(1);
}

export const env = parsed.data;
