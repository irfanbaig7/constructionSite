
import { z } from "zod";

export const text = (max = 120) => z.string().trim().min(1, "This field is required").max(max);
export const objectId = z.string().regex(/^[a-f\d]{24}$/i, "Invalid id.");
export const dateStr = z.string().regex(/^\d{4}-\d{2}-\d{2}$/, "Choose a valid date");
export const amount = z.coerce.number().positive("Amount must be greater than 0").max(1e9);
export const email = z.string().trim().toLowerCase().email("Enter a valid email address.");
export const phone = z
    .string()
    .transform((s) => s.replace(/\D/g, "").slice(-10))
    .pipe(z.string().length(10, "Enter a 10-digit phone number"));

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
