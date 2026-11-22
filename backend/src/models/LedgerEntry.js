import mongoose from "mongoose";
import jsonId from "../utils/jsonId.js";

const schema = new mongoose.Schema(
    {
        projectId: { type: mongoose.Schema.Types.ObjectId, ref: "Project", required: true, index: true },
        category: { type: String, required: true },
        title: { type: String, required: true, trim: true },
        date: { type: String, required: true },
        amount: { type: Number, required: true, min: 0 },
        auto: { type: Boolean, default: false }, // created by the app (material), cannot be deleted
    },
    { timestamps: true }
);
schema.plugin(jsonId);

export default mongoose.model("LedgerEntry", schema);