import { Router } from "express";
import { requireAuth } from "../middleware/auth.js";
import { loadProject } from "../middleware/project.js";
import { HttpError } from "./errors.js";

// CRUD for a collection that belongs to a project.
// who: role allowed. build(req, data): extra fields computed on the server. allowDelete: whether records may be deleted.
export function childRouter({ Model, who, schema, build, allowDelete = true, deleteFilter = {}, sort = { date: -1, createdAt: -1 }, missing = "Nahi mila." }) {
    const router = Router({ mergeParams: true });
    router.use(requireAuth, loadProject(who));

    router.get("/", async (req, res) => res.json(await Model.find({ projectId: req.project._id }).sort(sort)));

    router.post("/", async (req, res) => {
        const data = schema.parse(req.body);
        const extra = build ? await build(req, data) : {};
        res.status(201).json(await Model.create({ ...data, ...extra, projectId: req.project._id }));
    });

    if (allowDelete) {
        router.delete("/:id", async (req, res) => {
            const doc = await Model.findOneAndDelete({ _id: req.params.id, projectId: req.project._id, ...deleteFilter });
            if (!doc) throw new HttpError(404, missing);
            res.json({ ok: true });
        });
    }

    return router;
}
