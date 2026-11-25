
import { Router } from "express";
import mongoose from "mongoose";
import { z } from "zod";
import Payment from "../models/Payment.js";
import PaymentRequest from "../models/PaymentRequest.js";
import Project from "../models/Project.js";
import { requireAuth, requireRole } from "../middleware/auth.js";
import { loadProject } from "../middleware/project.js";
import { mountPayment } from "../utils/razorpay.js";
import { committedPayments } from "../utils/money.js";
import { today } from "../utils/today.js";
import { HttpError } from "../utils/errors.js";
import { text, amount } from "../schemas/common.js";

const router = Router({ mergeParams: true });
router.use(requireAuth, loadProject());

const pending = (req, id) => ({ _id: id, projectId: req.project._id, status: "pending" });

// Payment is recorded only once the homeowner has actually paid.
export async function recordProjectPayment(r, paymentId) {
    return mongoose.connection.transaction(async (session) => {
        const done = await PaymentRequest.findOneAndUpdate(
            { _id: r._id, projectId: r.projectId, status: "pending", orderId: r.orderId },
            { status: "paid", paidAt: new Date(), method: "razorpay", paymentId },
            { returnDocument: "after", session },
        );
        if (!done) return PaymentRequest.findOne({ _id: r._id, projectId: r.projectId, status: "paid", paymentId }).session(session);
        await Payment.create([{ projectId: r.projectId, label: done.label, date: today(), amount: done.amount, method: done.method }], { session });
        return done;
    });
}

router.get("/", async (req, res) =>
    res.json(await PaymentRequest.find({ projectId: req.project._id }).sort({ createdAt: -1 }))
);

router.post("/", requireRole("contractor"), async (req, res) => {
    const b = z.object({ label: text(80), amount, note: z.string().trim().max(300).default("") }).parse(req.body);
    const result = await mongoose.connection.transaction(async (session) => {
        const project = await Project.findOneAndUpdate(
            { _id: req.project._id }, { $inc: { paymentRevision: 1 } }, { session },
        );
        if (!project) throw new HttpError(404, "Project not found.");
        if (Math.round(b.amount * 100) + await committedPayments(project._id, session) > Math.round(project.budget * 100))
            throw new HttpError(400, "Amount exceeds the balance after outstanding requests.");
        const [request] = await PaymentRequest.create([{ ...b, projectId: project._id }], { session });
        return request;
    });
    res.status(201).json(result);
});

router.post("/:rid/cancel", requireRole("contractor"), async (req, res) => {
    const r = await PaymentRequest.findOneAndUpdate({ ...pending(req, req.params.rid), orderId: null }, { status: "cancelled" }, { returnDocument: "after" });
    if (!r) throw new HttpError(409, "This request is closed or checkout has already started.");
    res.json(r);
});

mountPayment(router, {
    Model: PaymentRequest,
    openFilter: { status: "pending" },
    amountOf: (r) => r.amount,
    prefix: "pr",
    onPaid: (_req, r, paymentId) => recordProjectPayment(r, paymentId),
});

export default router;
