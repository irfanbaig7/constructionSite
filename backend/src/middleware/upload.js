import multer from "multer";

export const uploadImages = (field, max) =>
    multer({
        storage: multer.memoryStorage(),
        limits: { fileSize: 8 * 1024 * 1024, files: max },
        fileFilter: (_req, file, cb) => cb(null, file.mimetype.startsWith("image/")),
    }).array(field, max);