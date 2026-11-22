import mongoose from "mongoose";

// One document per contractor + day + site.
const attendanceSchema = new mongoose.Schema(
    {
        ownerId: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
        date: { type: String, required: true }, // YYYY-MM-DD
        projectId: { type: String, required: true },
        workerIds: [{ type: String }],
    },
    { timestamps: true }
);
attendanceSchema.index({ ownerId: 1, date: 1, projectId: 1 }, { unique: true });

export default mongoose.model("Attendance", attendanceSchema);