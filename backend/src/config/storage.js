
import fs from "fs/promises";
import path from "path";
import crypto from "crypto";
import sharp from "sharp";
import { v2 as cloudinary } from "cloudinary";
import { env } from "./env.js";
import { HttpError } from "../utils/errors.js";

export const uploadRoot = path.resolve("uploads");
const cloudConfigured = Boolean(env.CLOUDINARY_CLOUD_NAME && env.CLOUDINARY_API_KEY && env.CLOUDINARY_API_SECRET);
if (cloudConfigured) cloudinary.config({
    cloud_name: env.CLOUDINARY_CLOUD_NAME,
    api_key: env.CLOUDINARY_API_KEY,
    api_secret: env.CLOUDINARY_API_SECRET,
    secure: true,
    timeout: 15_000,
});

const authenticated = { resource_type: "image", type: "authenticated" };
const base = (env.PUBLIC_API_URL || `http://localhost:${env.PORT}`).replace(/\/$/, "");

export function photoDownloadUrl(publicId) {
    if (!cloudConfigured) throw new HttpError(503, "Photo storage is unavailable.");
    return cloudinary.utils.private_download_url(publicId, "jpg", {
        ...authenticated, expires_at: Math.floor(Date.now() / 1000) + 60,
    });
}

export async function saveImage(buffer, folder) {
    let out;
    try {
        const image = sharp(buffer, { limitInputPixels: 24_000_000 });
        const { format } = await image.metadata();
        if (!["jpeg", "png", "webp", "heif"].includes(format)) throw new Error("Unsupported image");
        out = await image.rotate().resize({ width: 1600, height: 1600, fit: "inside", withoutEnlargement: true }).jpeg({ quality: 80 }).toBuffer();
    } catch {
        throw new HttpError(400, "Invalid photo. Please try uploading a different one.");
    }
    const id = crypto.randomUUID();
    if (cloudConfigured) {
        const publicId = `siteproof/${folder}/${id}`;
        await new Promise((resolve, reject) => {
            cloudinary.uploader.upload_stream({ ...authenticated, public_id: publicId, overwrite: false },
                (error, result) => error ? reject(new HttpError(502, "Photo upload failed. Please try again.")) : resolve(result)).end(out);
        });
        return { url: `${base}/media/${folder}/${id}.jpg`, publicId };
    }
    if (env.NODE_ENV === "production") throw new HttpError(503, "Persistent photo storage is unavailable.");
    const dir = path.join(uploadRoot, folder);
    await fs.mkdir(dir, { recursive: true });
    const name = `${id}.jpg`;
    await fs.writeFile(path.join(dir, name), out);
    return { url: `${base}/uploads/${folder}/${name}`, publicId: `${folder}/${name}` };
}

export const deleteUploadedPhoto = ({ publicId }) => publicId.startsWith("siteproof/")
    ? cloudinary.uploader.destroy(publicId, authenticated)
    : fs.unlink(path.join(uploadRoot, publicId));
