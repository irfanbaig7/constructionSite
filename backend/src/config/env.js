import "dotenv/config";
import { z } from "zod";

const schema = z.object({
    NODE_ENV: z.enum(["development", "production", "test"]).default("development"),
    PORT: z.coerce.number().default(5000),
    MONGODB_URI: z.string().min(1, "MONGODB_URI chahiye"),
    JWT_SECRET: z.string().min(32, "JWT_SECRET kam se kam 32 characters ka ho"),
    CLIENT_ORIGIN: z.string().default("http://localhost:3000"),
    PUBLIC_API_URL: z.string().optional(),
    RAZORPAY_KEY_ID: z.string().optional(),
    RAZORPAY_KEY_SECRET: z.string().optional(),
});

const parsed = schema.safeParse(process.env);
if (!parsed.success) {
    console.error("Invalid .env:\n" + parsed.error.issues.map((i) => `- ${i.path.join(".")}: ${i.message}`).join("\n"));
    process.exit(1);
}

export const env = parsed.data;