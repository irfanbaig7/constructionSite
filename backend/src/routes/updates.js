import { Router } from "express";
import { z } from "zod";
import Material from "../models/Material.js";
import DailyUpdate from "../models/DailyUpdate.js";
import { requireAuth, requireRole } from "../middleware/auth.js";
import { loadProject } from "../middleware/project.js";
import { uploadImages } from "../middleware/upload.js";
import { saveImage } from "../config/storage.js";
import { setSiteWorkers, assertOwnWorkers } from "../utils/attendance.js";
import { consumeStock, restoreStock, presentUpdates } from "../utils/materialFlow.js";
import { HttpError } from "../utils/errors.js";
import { objectId, jsonField } from "../schemas/common.js";

const router = Router({ mergeParams: true });
router.use(requireAuth, loadProject());

const body = z.object({
    summary: z.string().trim().min(1, "Kaam likho.").max(2000),
    workerIds: jsonField(z.array(objectId).min(1, "Kam se kam 1 worker chuno.").max(500)),
    materialUsage: jsonField(z.array(z.object({ materialId: objectId, quantity: z.coerce.number().positive() })).max(50)),
});

router.get("/", async (req, res) => {
    const list = await DailyUpdate.find({ projectId: req.project._id }).sort({ at: -1 });
    res.json(await presentUpdates(req.project._id, list, req.user.role));
});

router.post("/", requireRole("contractor"), uploadImages("photos", 6), async (req, res) => {
    const { summary, workerIds, materialUsage } = body.parse(req.body);
    if (!req.files?.length) throw new HttpError(400, "Add at least 1 photo as proof.");

    const ids = [...new Set(workerIds)];
    await assertOwnWorkers(req.user._id, ids);

    const usage = new Map();
    for (const { materialId, quantity } of materialUsage) usage.set(materialId, (usage.get(materialId) ?? 0) + quantity);
    const mats = await Material.find({ _id: { $in: [...usage.keys()] }, projectId: req.project._id });
    if (mats.length !== usage.size) throw new HttpError(400, "Invalid material selected.");

    await consumeStock(req.project._id, usage);
    try {
        const photos = await Promise.all(req.files.map((f) => saveImage(f.buffer, String(req.project._id))));
        const update = await DailyUpdate.create({
            projectId: req.project._id,
            summary,
            photos,
            workerIds: ids,
            workers: ids.length,
            materials: mats.map((m) => `${m.name} ${usage.get(String(m._id))} ${m.unit}`),
        });
        await setSiteWorkers(req.user._id, String(req.project._id), ids); // attendance stays in sync
        res.status(201).json(update);
    } catch (e) {
        await restoreStock(usage);
        throw e;
    }
});

export default router;