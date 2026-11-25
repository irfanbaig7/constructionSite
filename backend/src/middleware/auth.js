import jwt from "jsonwebtoken";
import { createHash, randomUUID } from "node:crypto";
import User from "../models/User.js";
import RevokedSession from "../models/RevokedSession.js";
import { env } from "../config/env.js";
import { HttpError } from "../utils/errors.js";

const COOKIE = "sp_token";
const WEEK = 7 * 24 * 60 * 60 * 1000;
const base = { httpOnly: true, sameSite: "lax", secure: env.NODE_ENV === "production" };

export function startSession(res, user) {
    const token = jwt.sign({ id: user.id, v: user.tokenVersion }, env.JWT_SECRET, { expiresIn: "7d", jwtid: randomUUID() });
    res.cookie(COOKIE, token, { ...base, maxAge: WEEK });
}

export const endSession = (res) => res.clearCookie(COOKIE, base);

const sessionId = (token) => createHash("sha256").update(token).digest("hex");

function readClaims(token) {
    try {
        return jwt.verify(token, env.JWT_SECRET, { algorithms: ["HS256"] });
    } catch {
        return null;
    }
}

export async function authenticateSession(token) {
    if (!token) throw new HttpError(401, "Login required.");
    const payload = readClaims(token);
    if (!payload) throw new HttpError(401, "Session expired. Please login again.");
    const id = sessionId(token);
    const [user, revoked] = await Promise.all([User.findById(payload.id), RevokedSession.exists({ _id: id })]);
    if (!user || revoked || user.tokenVersion !== payload.v) throw new HttpError(401, "Session expired. Please login again.");
    return { user, id, expiresAt: payload.exp * 1000 };
}

export async function revokeSession(req) {
    const token = req.cookies?.[COOKIE];
    const payload = token && readClaims(token);
    if (!payload) return null;
    const id = sessionId(token);
    await RevokedSession.updateOne({ _id: id }, { $setOnInsert: { expiresAt: new Date(payload.exp * 1000) } }, { upsert: true });
    return id;
}

export async function requireAuth(req, _res, next) {
    const session = await authenticateSession(req.cookies?.[COOKIE]);
    req.user = session.user;
    next();
}

export const requireRole = (role) => (req, _res, next) => {
    if (req.user.role !== role) throw new HttpError(403, "Not allowed.");
    next();
};
