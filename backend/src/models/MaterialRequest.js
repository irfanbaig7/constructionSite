import mongoose from "mongoose";
import jsonId from "../utils/jsonId.js";

const requestSchema = new mongoose.Schema(
    {
        projectId: { type: mongoose.Schema.Types.ObjectId, ref: "Project", required: true, index: true },
        name: { type: String, required: true, trim: true },
        unit: { type: String, required: true },
        quantity: { type: Number, required: true, min: 0.01 },
        note: { type: String, default: "" },
        target: { type: Number, default: 0 },
        minStock: { type: Number, default: 0 },
        status: {
            type: String,
            enum: ["pending", "owner_bringing", "quote_needed", "awaiting_payment", "fulfilled", "cancelled"],
            default: "pending",
        },
        source: { type: String, enum: ["owner", "contractor"] },
        deliveredQty: { type: Number },
        amount: { type: Number }, // contractor quote (or owner's own spend)
        orderId: { type: String },
        paymentId: { type: String },
        fulfilledAt: { type: Date },
    },
    { timestamps: true }
);
requestSchema.plugin(jsonId);

export default mongoose.model("MaterialRequest", requestSchema);