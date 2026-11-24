import Worker from "../models/Worker.js";
import { HttpError } from "./errors.js";

export async function assertOwnWorkers(ownerId, ids) {
    if (ids.length && (await Worker.countDocuments({ _id: { $in: ids }, ownerId })) !== ids.length)
        throw new HttpError(400, "Invalid worker selected.");
}
