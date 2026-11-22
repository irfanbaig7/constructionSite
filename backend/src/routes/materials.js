import { Router } from "express";
import { z } from "zod";
import Material from "../models/Material.js";
import { requireAuth, requireRole } from "../middleware/auth.js";
import { loadProject } from "../middleware/project.js";
import { HttpError } from "../utils/errors.js";

const router = Router({ mergeParams: true });
router.use(requireAuth, loadProject());

// Contractor sees stock and limits. Homeowner sees only used/target.
router.get("/", async (req, res) => {
    const list = await Material.find({ projectId: req.project._id }).sort({ createdAt: 1 });
    res.json(
        req.user.role === "contractor"
            ? list.map((m) => ({ ...m.toJSON(), stock: m.received - m.used }))
            : list.map((m) => ({ id: m.id, name: m.name, unit: m.unit, used: m.used, target: m.target }))
    );
});

// Stock changes only via deliveries and daily-update usage; only the limits can be edited.
router.put("/:id", requireRole("contractor"), async (req, res) => {
    const limits = z.object({ target: z.coerce.number().min(0), minStock: z.coerce.number().min(0) }).parse(req.body);
    const m = await Material.findOne({ _id: req.params.id, projectId: req.project._id });
    if (!m) throw new HttpError(404, "Material not found.");
    m.set(limits);
    await m.save();
    res.json({ ...m.toJSON(), stock: m.received - m.used });
});

export default router;