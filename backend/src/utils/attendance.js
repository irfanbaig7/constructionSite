import Attendance from "../models/Attendance.js";
import Worker from "../models/Worker.js";
import { today } from "./today.js";
import { HttpError } from "./errors.js";

export async function attendanceMap(ownerId) {
    const rows = await Attendance.find({ ownerId, date: today() });
    return Object.fromEntries(rows.map((r) => [r.projectId, r.workerIds]));
}

// A worker can be on one site only, so they are removed from the other sites today.
export async function setSiteWorkers(ownerId, projectId, workerIds) {
    const filter = { ownerId, date: today() };
    await Attendance.updateMany({ ...filter, projectId: { $ne: projectId } }, { $pull: { workerIds: { $in: workerIds } } });
    await Attendance.findOneAndUpdate({ ...filter, projectId }, { workerIds }, { upsert: true });
    return attendanceMap(ownerId);
}

export async function assertOwnWorkers(ownerId, ids) {
    if (ids.length && (await Worker.countDocuments({ _id: { $in: ids }, ownerId })) !== ids.length)
        throw new HttpError(400, "Invalid worker selected.");
}