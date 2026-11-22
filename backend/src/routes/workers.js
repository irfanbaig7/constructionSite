import { Router } from "express";
import { z } from "zod";
import Worker from "../models/Worker.js";
import { requireAuth, requireRole } from "../middleware/auth.js";
import { text, phone } from "../schemas/common.js";

const router = Router();
router.use(requireAuth, requireRole("contractor"));

router.get("/", async (req, res) => res.json(await Worker.find({ ownerId: req.user._id }).sort({ createdAt: 1 })));

router.post("/", async (req, res) => {
    const { name, phone: p } = z.object({ name: text(60), phone }).parse(req.body);
    res.status(201).json(await Worker.create({ ownerId: req.user._id, name, phone: `+91 ${p.slice(0, 5)} ${p.slice(5)}` }));
});

export default router;