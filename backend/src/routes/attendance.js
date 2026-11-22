import { Router } from "express";
import { z } from "zod";
import { requireAuth, requireRole } from "../middleware/auth.js";
import { loadProject } from "../middleware/project.js";
import { attendanceMap, setSiteWorkers, assertOwnWorkers } from "../utils/attendance.js";
import { objectId } from "../schemas/common.js";

const router = Router();
router.use(requireAuth, requireRole("contractor"));

router.get("/today", async (req, res) => res.json(await attendanceMap(req.user._id)));

router.put("/today/:projectId", loadProject("contractor"), async (req, res) => {
    const { workerIds } = z.object({ workerIds: z.array(objectId).max(500) }).parse(req.body);
    const ids = [...new Set(workerIds)];
    await assertOwnWorkers(req.user._id, ids);
    res.json(await setSiteWorkers(req.user._id, String(req.project._id), ids));
});

export default router;