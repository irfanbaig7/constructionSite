import mongoose from "mongoose";
import jsonId from "../utils/jsonId.js";

const milestoneSchema = new mongoose.Schema(
    {
        name: { type: String, required: true },
        status: { type: String, enum: ["done", "active", "pending"], default: "pending" },
    },
    { _id: false }
);

const projectSchema = new mongoose.Schema(
    {
        contractorId: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true, index: true },
        contractor: { type: String, required: true },
        contractorPhone: { type: String },
        name: { type: String, required: true, trim: true },
        owner: { type: String, required: true, trim: true },
        ownerPhone: { type: String, required: true },
        ownerEmail: { type: String, required: true, lowercase: true, trim: true, index: true },
        location: { type: String, required: true, trim: true },
        type: { type: String, default: "Residential House" },
        area: { type: String, default: "" },
        rooms: { type: String, default: "" },
        status: { type: String, enum: ["planned", "in_progress", "completed"], default: "in_progress" },
        progress: { type: Number, default: 0, min: 0, max: 100 },
        budget: { type: Number, required: true, min: 1 },
        startDate: { type: String, required: true },
        expectedEnd: { type: String, required: true },
        notes: { type: String, default: "" },
        milestones: [milestoneSchema],
    },
    { timestamps: true }
);
projectSchema.plugin(jsonId);

export default mongoose.model("Project", projectSchema);