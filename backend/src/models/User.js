import mongoose from "mongoose";
import jsonId from "../utils/jsonId.js";

const userSchema = new mongoose.Schema(
    {
        name: { type: String, required: true, trim: true },
        email: { type: String, required: true, unique: true, lowercase: true, trim: true },
        password: { type: String, required: true, select: false },
        role: { type: String, enum: ["contractor", "homeowner"], required: true },
        phone: { type: String, trim: true },
        tokenVersion: { type: Number, default: 0 },
    },
    { timestamps: true }
);
userSchema.plugin(jsonId);

export default mongoose.model("User", userSchema);