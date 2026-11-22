import Payment from "../models/Payment.js";

export async function receivedByProject(ids) {
    const rows = await Payment.aggregate([
        { $match: { projectId: { $in: ids } } },
        { $group: { _id: "$projectId", total: { $sum: "$amount" } } },
    ]);
    return Object.fromEntries(rows.map((r) => [String(r._id), r.total]));
}

export const received = async (id) => (await receivedByProject([id]))[String(id)] ?? 0;