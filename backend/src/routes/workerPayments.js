import { z } from "zod";
import Worker from "../models/Worker.js";
import WorkerPayment from "../models/WorkerPayment.js";
import { childRouter } from "../utils/childRouter.js";
import { HttpError } from "../utils/errors.js";
import { objectId, amount, dateStr } from "../schemas/common.js";

export default childRouter({
    Model: WorkerPayment,
    who: "contractor",
    missing: "Payment not found.",
    schema: z.object({ workerId: objectId, amount, date: dateStr, note: z.string().trim().max(200).default("") }),
    build: async (req, { workerId }) => {
        const w = await Worker.findOne({ _id: workerId, ownerId: req.user._id });
        if (!w) throw new HttpError(400, "Worker chuno.");
        return { workerId: String(w._id), workerName: w.name };
    },
});