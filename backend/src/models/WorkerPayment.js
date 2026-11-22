import mongoose from "mongoose";
import jsonId from "../utils/jsonId.js";

const schema = new mongoose.Schema(
    {
        projectId: { type: mongoose.Schema.Types.ObjectId, ref: "Project", required: true, index: true },
        workerId: { type: String, required: true },
        workerName: { type: String, required: true },
        amount: { type: Number, required: true, min: 1 },
        date: { type: String, required: true },
        note: { type: String, default: "" },
    },
    { timestamps: true }
);
schema.plugin(jsonId);

export default mongoose.model("WorkerPayment", schema);