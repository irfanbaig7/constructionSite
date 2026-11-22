import { Router } from "express";
import { z } from "zod";
import Project from "../models/Project.js";
import Payment from "../models/Payment.js";
import { requireAuth, requireRole } from "../middleware/auth.js";
import { loadProject, scopeOf } from "../middleware/project.js";
import { receivedByProject, received } from "../utils/money.js";
import { today } from "../utils/today.js";
import { HttpError } from "../utils/errors.js";
import { text, phone, email, amount, dateStr } from "../schemas/common.js";

const router = Router();
router.use(requireAuth);

const createSchema = z
    .object({
        name: text(80),
        owner: text(80),
        ownerPhone: phone,
        ownerEmail: email,
        location: text(120),
        type: z.string().trim().max(60).default("Residential House"),
        area: z.string().trim().max(40).default(""),
        rooms: z.string().trim().max(40).default(""),
        budget: amount,
        advance: z.coerce.number().min(0).default(0),
        startDate: dateStr,
        expectedEnd: dateStr,
        notes: z.string().trim().max(1000).default(""),
        milestones: z.array(z.string().trim().min(1).max(60)).max(20).default([]),
    })
    .refine((d) => d.advance <= d.budget, { message: "Advance budget se zyada nahi ho sakta.", path: ["advance"] })
    .refine((d) => d.expectedEnd > d.startDate, { message: "Expected end date start date ke baad honi chahiye.", path: ["expectedEnd"] });

const patchSchema = z
    .object({
        name: text(80),
        owner: text(80),
        location: text(120),
        status: z.enum(["planned", "in_progress", "completed"]),
        progress: z.coerce.number().min(0).max(100),
        budget: amount,
        expectedEnd: dateStr,
    })
    .partial();

router.get("/", async (req, res) => {
    const list = await Project.find(scopeOf(req.user)).sort({ createdAt: -1 });
    const sums = await receivedByProject(list.map((p) => p._id));
    res.json(list.map((p) => ({ ...p.toJSON(), received: sums[p.id] ?? 0 })));
});

router.post("/", requireRole("contractor"), async (req, res) => {
    const { advance, ...data } = createSchema.parse(req.body);
    const project = await Project.create({
        ...data,
        contractorId: req.user._id,
        contractor: req.user.name,
        contractorPhone: req.user.phone ?? "",
        milestones: data.milestones.map((name, i) => ({ name, status: i === 0 ? "active" : "pending" })),
    });
    if (advance > 0) await Payment.create({ projectId: project._id, label: "Advance", date: today(), amount: advance });
    res.status(201).json(project);
});

router.get("/:id", loadProject(), async (req, res) => {
    const payments = await Payment.find({ projectId: req.project._id }).sort({ date: 1, createdAt: 1 });
    res.json({ project: req.project, payments });
});

router.patch("/:id", loadProject("contractor"), async (req, res) => {
    const p = req.project;
    p.set(patchSchema.parse(req.body));
    if (p.budget < (await received(p._id))) throw new HttpError(400, "Budget cannot be less than payments already received.");
    if (p.expectedEnd <= p.startDate) throw new HttpError(400, "Expected end must be after the start date.");
    res.json(await p.save());
});

export default router;