import mongoose from "mongoose";
import jsonId from "../utils/jsonId.js";

const expenseSchema = new mongoose.Schema(
    {
        projectId: { type: mongoose.Schema.Types.ObjectId, ref: "Project", required: true, index: true },
        category: { type: String, required: true },
        title: { type: String, required: true, trim: true },
        date: { type: String, required: true },
        amount: { type: Number, required: true, min: 1 },
    },
    { timestamps: true }
);
expenseSchema.plugin(jsonId);

export default mongoose.model("Expense", expenseSchema);