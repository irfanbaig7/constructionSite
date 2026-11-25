
import { Router } from "express";
import bcrypt from "bcryptjs";
import rateLimit from "express-rate-limit";
import { z } from "zod";
import User from "../models/User.js";
import { requireAuth, startSession, endSession, revokeSession } from "../middleware/auth.js";
import { HttpError } from "../utils/errors.js";
import { text, email, phone } from "../schemas/common.js";
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

const toSession = (u) => ({ id: u.id, name: u.name, email: u.email, role: u.role, phone: u.phone ?? "" });
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

router.use(requireAuth);

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
            $inc: { tokenVersion: 1 } },
        { returnDocument: "after" },
    );
    if (!updated) throw new HttpError(409, "Your password changed. Please try again.");
    disconnectUser(updated.id);
    sessionOf(res, updated);
});

export default router;
