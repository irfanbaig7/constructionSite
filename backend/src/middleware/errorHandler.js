import { ZodError } from "zod";
import mongoose from "mongoose";
import multer from "multer";
import { HttpError } from "../utils/errors.js";

export function errorHandler(err, _req, res, _next) {
    if (res.headersSent) return _next(err);
    let status = 500;
    let message = "Server error.";

    if (err instanceof HttpError) [status, message] = [err.status, err.message];
    else if (err instanceof ZodError) [status, message] = [400, err.issues[0]?.message ?? "Please fill all fields correctly"];
    else if (err instanceof multer.MulterError)
        [status, message] = [400, err.code === "LIMIT_FILE_SIZE" ? "Photo is larger than 8 MB" : "Invalid photos"];
    else if (err instanceof mongoose.Error.CastError) [status, message] = [404, "Not found."];
    else if (err instanceof mongoose.Error.ValidationError) [status, message] = [400, "Invalid data."];
    else if (err?.code === 11000) [status, message] = [409, "This already exists"];
    else if (err?.type === "entity.parse.failed") [status, message] = [400, "Invalid JSON."];
    else if (err?.type === "entity.too.large") [status, message] = [413, "Request is too large."];

    if (status >= 500) _req.log?.error({ errorName: err.name, errorCode: err.code, status }, "API request failed");
    res.status(status).json({ message });
}
