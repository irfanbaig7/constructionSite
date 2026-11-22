import jwt from "jsonwebtoken";
import User from "../models/User.js";
import { env } from "../config/env.js";
import { HttpError } from "../utils/errors.js";

const COOKIE = "sp_token";
const WEEK = 7 * 24 * 60 * 60 * 1000;
const base = { httpOnly: true, sameSite: "lax", secure: env.NODE_ENV === "production" };

export function startSession(res, user) {
    const token = jwt.sign({ id: user.id, v: user.tokenVersion }, env.JWT_SECRET, { expiresIn: "7d" });
    res.cookie(COOKIE, token, { ...base, maxAge: WEEK });
}

export const endSession = (res) => res.clearCookie(COOKIE, base);

export async function requireAuth(req, _res, next) {
    const token = req.cookies?.[COOKIE];
    if (!token) throw new HttpError(401, "Login required.");

    let payload;
    try {
        payload = jwt.verify(token, env.JWT_SECRET);
    } catch {
        throw new HttpError(401, "Session expired. Please login again.");
    }

    const user = await User.findById(payload.id);
    if (!user || user.tokenVersion !== payload.v) throw new HttpError(401, "Session expired. Please login again.");
    req.user = user;
    next();
}

export const requireRole = (role) => (req, _res, next) => {
    if (req.user.role !== role) throw new HttpError(403, "Not allowed.");
    next();
};