import mongoose from "mongoose";
import jsonId from "../utils/jsonId.js";

const schema = new mongoose.Schema(
    {
        projectId: { type: mongoose.Schema.Types.ObjectId, ref: "Project", required: true, index: true },
        label: { type: String, required: true, trim: true },
        amount: { type: Number, required: true, min: 1 },
        note: { type: String, default: "" },
        status: { type: String, enum: ["pending", "paid", "cancelled"], default: "pending" },
        orderId: { type: String },
        paymentId: { type: String },
        method: { type: String, enum: ["razorpay", "cash"] },
        paidAt: { type: Date },
    },
    { timestamps: true }
);
schema.plugin(jsonId);

export default mongoose.model("PaymentRequest", schema);