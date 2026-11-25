import { HttpError } from "../utils/errors.js";

const safe = new Set(["GET", "HEAD", "OPTIONS"]);

export const requireRequestOrigin = (origin) => (req, _res, next) => {
    if (!safe.has(req.method) && req.get("Origin") !== origin)
        throw new HttpError(403, "Request origin not allowed.");
    next();
};
