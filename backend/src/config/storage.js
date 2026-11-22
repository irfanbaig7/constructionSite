import fs from "fs/promises";
import path from "path";
import crypto from "crypto";
import sharp from "sharp";
import { env } from "./env.js";
import { HttpError } from "../utils/errors.js";

const ROOT = path.resolve("uploads");

// Re-encodes every upload (rejects non-images, strips EXIF, caps size) and returns its public URL.
export async function saveImage(buffer, folder) {
    let out;
    try {
        out = await sharp(buffer).rotate().resize({ width: 1600, height: 1600, fit: "inside", withoutEnlargement: true }).jpeg({ quality: 80 }).toBuffer();
    } catch {
        throw new HttpError(400, "Photo sahi nahi hai. Dusri photo try karo.");
    }
    const dir = path.join(ROOT, folder);
    await fs.mkdir(dir, { recursive: true });
    const name = `${crypto.randomUUID()}.jpg`;
    await fs.writeFile(path.join(dir, name), out);
    const base = env.PUBLIC_API_URL || `http://localhost:${env.PORT}`;
    return { url: `${base}/uploads/${folder}/${name}`, publicId: `${folder}/${name}` };
}