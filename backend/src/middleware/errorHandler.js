import { ZodError } from "zod";
import mongoose from "mongoose";
import multer from "multer";
import { HttpError } from "../utils/errors.js";

export function errorHandler(err, _req, res, _next) {
    let status = 500;
    let message = "Server error.";

    if (err instanceof HttpError) [status, message] = [err.status, err.message];
    else if (err instanceof ZodError) [status, message] = [400, err.issues[0]?.message ?? "Sab fields sahi bharo."];
    else if (err instanceof multer.MulterError)
        [status, message] = [400, err.code === "LIMIT_FILE_SIZE" ? "Photo 8 MB se badi hai." : "Photos sahi nahi hain."];
    else if (err instanceof mongoose.Error.CastError) [status, message] = [404, "Not found."];
    else if (err instanceof mongoose.Error.ValidationError)
        [status, message] = [400, Object.values(err.errors)[0]?.message ?? "Invalid data."];
    else if (err?.code === 11000) [status, message] = [409, "Ye pehle se maujood hai."];
    else if (err?.type === "entity.parse.failed") [status, message] = [400, "Invalid JSON."];

    if (status >= 500) console.error(err);
    res.status(status).json({ message });
}