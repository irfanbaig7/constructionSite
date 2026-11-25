import { Router } from "express";
import mongoose from "mongoose";
import { z } from "zod";
import Material from "../models/Material.js";
import DailyUpdate from "../models/DailyUpdate.js";
import { requireAuth, requireRole } from "../middleware/auth.js";
import { loadProject } from "../middleware/project.js";
import { uploadImages } from "../middleware/upload.js";
import { deleteUploadedPhoto, saveImage } from "../config/storage.js";
import { assertOwnWorkers } from "../utils/workers.js";
import { consumeStock, presentUpdates } from "../utils/materialFlow.js";
import { HttpError } from "../utils/errors.js";
import { objectId, jsonField } from "../schemas/common.js";

const router = Router({ mergeParams: true });
router.use(requireAuth, loadProject());

const body = z.object({
    summary: z.string().trim().min(1, "Kaam likho.").max(2000),
    workerIds: jsonField(z.array(objectId).min(1, "Kam se kam 1 worker chuno.").max(500)),
    materialUsage: jsonField(z.array(z.object({ materialId: objectId, quantity: z.coerce.number().positive() })).max(50)),
    at: z.iso.datetime().optional(), // date and time of the work, filled by the contractor
});


router.get("/", async (req, res) => {
    const list = await DailyUpdate.find({ projectId: req.project._id }).sort({ at: -1 });
    res.json(await presentUpdates(req.project._id, list, req.user.role));
});

router.post("/", requireRole("contractor"), uploadImages("photos", 6), async (req, res) => {
    const { summary, workerIds, materialUsage, at } = body.parse(req.body);
    if (!req.files?.length) throw new HttpError(400, "Add at least 1 photo as proof.");

    const ids = [...new Set(workerIds)];
    await assertOwnWorkers(req.user._id, ids);

    const usage = new Map();
    for (const { materialId, quantity } of materialUsage) usage.set(materialId, (usage.get(materialId) ?? 0) + quantity);
    const mats = await Material.find({ _id: { $in: [...usage.keys()] }, projectId: req.project._id });
    if (mats.length !== usage.size) throw new HttpError(400, "Invalid material selected.");

    const photos = [];
    try {
        for (const file of req.files) photos.push(await saveImage(file.buffer, req.project.id));
        const data = {
            projectId: req.project._id,
            ...(at && { at: new Date(at) }),
            summary,
            photos,
            workerIds: ids,
            workers: ids.length,
            materials: mats.map((m) => `${m.name} ${usage.get(String(m._id))} ${m.unit}`),
        };
        const update = await mongoose.connection.transaction(async (session) => {
            await consumeStock(req.project._id, usage, session);
            const [created] = await DailyUpdate.create([data], { session });
            return created;
        });
        res.status(201).json(update);
    } catch (e) {
        if (!e.hasErrorLabel?.("UnknownTransactionCommitResult"))
            await Promise.allSettled(photos.map(deleteUploadedPhoto));
        throw e;
    }
});

export default router;
