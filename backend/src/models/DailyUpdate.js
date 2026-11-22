import mongoose from "mongoose";
import jsonId from "../utils/jsonId.js";

const updateSchema = new mongoose.Schema(
    {
        projectId: { type: mongoose.Schema.Types.ObjectId, ref: "Project", required: true, index: true },
        at: { type: Date, default: Date.now },
        summary: { type: String, required: true, trim: true },
        photos: [{ _id: false, url: String, publicId: String }],
        workerIds: [{ type: String }],
        workers: { type: Number, default: 0 },
        materials: [{ type: String }],
        delivered: { type: String, default: "" },
    },
    { timestamps: true }
);
updateSchema.plugin(jsonId);

export default mongoose.model("DailyUpdate", updateSchema);