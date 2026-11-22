import { Router } from "express";
import Project from "../models/Project.js";
import DailyUpdate from "../models/DailyUpdate.js";
import { requireAuth } from "../middleware/auth.js";
import { scopeOf } from "../middleware/project.js";
import { presentUpdates } from "../utils/materialFlow.js";
import { HttpError } from "../utils/errors.js";

const router = Router();
router.use(requireAuth);

router.get("/:id", async (req, res) => {
    const update = await DailyUpdate.findById(req.params.id);
    const project = update && (await Project.findOne({ _id: update.projectId, ...scopeOf(req.user) }));
    if (!project) throw new HttpError(404, "Update not found.");
    const [json] = await presentUpdates(project._id, [update], req.user.role);
    res.json({ update: json, project });
});

export default router;