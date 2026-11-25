
import { Router } from "express";
import bcrypt from "bcryptjs";
import rateLimit from "express-rate-limit";
import { z } from "zod";
import User from "../models/User.js";
import { requireAuth, startSession, endSession, revokeSession } from "../middleware/auth.js";
import { HttpError } from "../utils/errors.js";
import { text, email, phone } from "../schemas/common.js";
import { newAccountToken, sendAccountEmail, tokenHash } from "../utils/accountEmail.js";
import { disconnectUser, disconnectSession } from "../realtime.js";

const router = Router();

const limiter = rateLimit({
    windowMs: 15 * 60 * 1000,
    limit: 10,
    skipSuccessfulRequests: true, // only failed attempts count
    standardHeaders: "draft-7",
    legacyHeaders: false,
    handler: (req, res) => {
        const mins = Math.max(1, Math.ceil((req.rateLimit.resetTime - Date.now()) / 60000));
        res.status(429).json({ message: `Too many failed attempts. Please try again after ${mins} minutes.` });
    },
});


const password = z
    .string()
    .min(8, "Password must be at least 8 characters long.")
    .refine((value) => Buffer.byteLength(value) <= 72, "Password is too long.")
    .regex(/^\S+$/, "Password cannot contain spaces.");

const DUMMY = bcrypt.hashSync("dummy-password", 10); // so unknown emails take as long as real ones

const toSession = (u) => ({ id: u.id, name: u.name, email: u.email, role: u.role, phone: u.phone ?? "", emailVerified: Boolean(u.emailVerifiedAt) });
const sessionOf = (res, user, status = 200) => {
    startSession(res, user);
    res.status(status).json({ user: toSession(user) });
};

router.post("/signup", limiter, async (req, res) => {
    const data = z.object({ name: text(60), email, password, role: z.enum(["contractor", "homeowner"]) }).parse(req.body);
    if (await User.exists({ email: data.email })) throw new HttpError(409, "An account with this email already exists.");
    sessionOf(res, await User.create({ ...data, password: await bcrypt.hash(data.password, 10) }), 201);
});

router.post("/login", limiter, async (req, res) => {
    const body = z.object({ email, password: z.string().min(1) }).parse(req.body);
    const user = await User.findOne({ email: body.email }).select("+password");
    const ok = await bcrypt.compare(body.password, user?.password ?? DUMMY);
    if (!user || !ok) throw new HttpError(401, "Incorrect email or password.");
    sessionOf(res, user);
});

router.post("/logout", async (req, res) => {
    const id = await revokeSession(req);
    if (id) disconnectSession(id);
    endSession(res);
    res.json({ ok: true });
});

const emailLimiter = rateLimit({ windowMs: 15 * 60_000, limit: 10, standardHeaders: "draft-7", legacyHeaders: false });
const token = z.string().regex(/^[a-f0-9]{64}$/);
const expiresAt = () => new Date(Date.now() + 30 * 60_000);
const resendAfter = () => new Date(Date.now() + 29 * 60_000);

router.post("/forgot-password", emailLimiter, async (req, res) => {
    const body = z.object({ email }).parse(req.body);
    const value = newAccountToken();
    const user = await User.findOneAndUpdate({
        email: body.email,
        $or: [{ resetExpiresAt: null }, { resetExpiresAt: { $lte: resendAfter() } }],
    }, {
        resetTokenHash: tokenHash(value), resetExpiresAt: expiresAt(),
    });
    if (user) await sendAccountEmail(user.email, "reset", value);
    res.json({ ok: true });
});

router.post("/reset-password", limiter, async (req, res) => {
    const body = z.object({ token, password }).parse(req.body);
    const user = await User.findOneAndUpdate(
        { resetTokenHash: tokenHash(body.token), resetExpiresAt: { $gt: new Date() } },
        { $set: { password: await bcrypt.hash(body.password, 10) },
            $unset: { resetTokenHash: "", resetExpiresAt: "" }, $inc: { tokenVersion: 1 } },
    );
    if (!user) throw new HttpError(400, "This reset link is invalid or has expired.");
    disconnectUser(user.id);
    res.json({ ok: true });
});

router.post("/verify-email", limiter, async (req, res) => {
    const body = z.object({ token }).parse(req.body);
    const user = await User.findOneAndUpdate(
        { verificationTokenHash: tokenHash(body.token), verificationExpiresAt: { $gt: new Date() } },
        { $set: { emailVerifiedAt: new Date() }, $unset: { verificationTokenHash: "", verificationExpiresAt: "" } },
    );
    if (!user) throw new HttpError(400, "This verification link is invalid or has expired.");
    res.json({ ok: true });
});

router.use(requireAuth);

router.post("/send-verification", emailLimiter, async (req, res) => {
    if (req.user.emailVerifiedAt) return res.json({ ok: true });
    const value = newAccountToken();
    const user = await User.findOneAndUpdate({
        _id: req.user._id, emailVerifiedAt: null,
        $or: [{ verificationExpiresAt: null }, { verificationExpiresAt: { $lte: resendAfter() } }],
    }, {
        verificationTokenHash: tokenHash(value), verificationExpiresAt: expiresAt(),
    });
    if (!user) throw new HttpError(429, "Please wait one minute before requesting another link.");
    if (!(await sendAccountEmail(user.email, "verify", value))) {
        await User.updateOne({ _id: user._id, verificationTokenHash: tokenHash(value) },
            { $unset: { verificationTokenHash: "", verificationExpiresAt: "" } });
        throw new HttpError(503, "Verification email could not be sent. Please try again.");
    }
    res.json({ ok: true });
});

router.get("/me", (req, res) => res.json({ user: toSession(req.user) }));

router.patch("/me", async (req, res) => {
    req.user.set(z.object({ name: text(60), phone }).partial().parse(req.body));
    await req.user.save();
    res.json({ user: toSession(req.user) });
});

// Changing the password logs out every other device (tokenVersion).
router.post("/password", limiter, async (req, res) => {
    const { current, next } = z.object({ current: z.string().min(1), next: password }).parse(req.body);
    const user = await User.findById(req.user._id).select("+password");
    if (!(await bcrypt.compare(current, user.password))) throw new HttpError(400, "Current password is incorrect.");
    const updated = await User.findOneAndUpdate(
        { _id: user._id, tokenVersion: user.tokenVersion },
        { $set: { password: await bcrypt.hash(next, 10) },
            $unset: { resetTokenHash: "", resetExpiresAt: "" }, $inc: { tokenVersion: 1 } },
        { returnDocument: "after" },
    );
    if (!updated) throw new HttpError(409, "Your password changed. Please try again.");
    disconnectUser(updated.id);
    sessionOf(res, updated);
});

export default router;
