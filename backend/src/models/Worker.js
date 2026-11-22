import mongoose from "mongoose";
import jsonId from "../utils/jsonId.js";

const workerSchema = new mongoose.Schema(
    {
        ownerId: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true, index: true },
        name: { type: String, required: true, trim: true },
        phone: { type: String, required: true, trim: true },
    },
    { timestamps: true }
);
workerSchema.plugin(jsonId);

export default mongoose.model("Worker", workerSchema);