import mongoose from "mongoose";
import Project from "../models/Project.js";
import { HttpError } from "../utils/errors.js";

export const scopeOf = (user) =>
    user.role === "contractor" ? { contractorId: user._id }
        : { ownerEmail: user.email };

// Loads the project the user is allowed to see into req.project. Optionally restricts to one role.
export function loadProject(only) {
    return async (req, _res, next) => {
        if (only && req.user.role !== only) throw new HttpError(403, "Not allowed.");
        const id = req.params.projectId ?? req.params.id;
        const project = mongoose.isValidObjectId(id) ? await Project.findOne({ _id: id, ...scopeOf(req.user) }) : null;
        if (!project) throw new HttpError(404, "Project not found.");
        req.project = project;
        next();
    };
}
