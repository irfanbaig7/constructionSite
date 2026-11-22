import mongoose from "mongoose";
import jsonId from "../utils/jsonId.js";

// stock = received - used
const materialSchema = new mongoose.Schema(
    {
        projectId: { type: mongoose.Schema.Types.ObjectId, ref: "Project", required: true, index: true },
        name: { type: String, required: true, trim: true },
        unit: { type: String, required: true },
        received: { type: Number, default: 0, min: 0 },
        used: { type: Number, default: 0, min: 0 },
        target: { type: Number, default: 0, min: 0 },
        minStock: { type: Number, default: 0, min: 0 },
    },
    { timestamps: true }
);
materialSchema.index({ projectId: 1, name: 1 }, { unique: true, collation: { locale: "en", strength: 2 } });
materialSchema.plugin(jsonId);

export default mongoose.model("Material", materialSchema);