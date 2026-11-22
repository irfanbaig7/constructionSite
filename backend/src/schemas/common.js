import { z } from "zod";

export const text = (max = 120) => z.string().trim().min(1, "Ye field zaroori hai.").max(max);
export const objectId = z.string().regex(/^[a-f\d]{24}$/i, "Invalid id.");
export const dateStr = z.string().regex(/^\d{4}-\d{2}-\d{2}$/, "Sahi date chuno.");
export const amount = z.coerce.number().positive("Amount 0 se zyada hona chahiye.").max(1e9);
export const email = z.string().trim().toLowerCase().email("Sahi email likho.");
export const phone = z
    .string()
    .transform((s) => s.replace(/\D/g, "").slice(-10))
    .pipe(z.string().length(10, "10 digit ka phone number likho."));

// Multipart fields arrive as strings; this parses a JSON string and validates it.
export const jsonField = (schema) =>
    z
        .string()
        .default("[]")
        .transform((s, ctx) => {
            try {
                return JSON.parse(s);
            } catch {
                ctx.addIssue({ code: "custom", message: "Invalid data." });
                return z.NEVER;
            }
        })
        .pipe(schema);