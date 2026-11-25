import Payment from "../models/Payment.js";
import PaymentRequest from "../models/PaymentRequest.js";

export async function receivedByProject(ids, session) {
    const query = Payment.aggregate([
        { $match: { projectId: { $in: ids } } },
        { $group: { _id: "$projectId", total: { $sum: "$amount" } } },
    ]);
    const rows = await (session ? query.session(session) : query);
    return Object.fromEntries(rows.map((r) => [String(r._id), r.total]));
}

export const received = async (id, session) => (await receivedByProject([id], session))[String(id)] ?? 0;

export async function committedPayments(id, session) {
    const paid = await received(id, session);
    const [pending] = await PaymentRequest.aggregate([
        { $match: { projectId: id, status: "pending" } },
        { $group: { _id: null, total: { $sum: "$amount" } } },
    ]).session(session);
    return Math.round(paid * 100) + Math.round((pending?.total ?? 0) * 100);
}
