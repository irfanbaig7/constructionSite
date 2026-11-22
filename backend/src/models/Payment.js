import mongoose from "mongoose";
import jsonId from "../utils/jsonId.js";

const paymentSchema = new mongoose.Schema(
    {
        projectId: { type: mongoose.Schema.Types.ObjectId, ref: "Project", required: true, index: true },
        label: { type: String, required: true, trim: true },
        date: { type: String, required: true },
        amount: { type: Number, required: true, min: 1 },
        method: { type: String, default: "" },
    },
    { timestamps: true }
);
paymentSchema.plugin(jsonId);

export default mongoose.model("Payment", paymentSchema);