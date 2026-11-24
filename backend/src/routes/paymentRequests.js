
import { Router } from "express";
import { z } from "zod";
import Payment from "../models/Payment.js";
import PaymentRequest from "../models/PaymentRequest.js";
import { requireAuth, requireRole } from "../middleware/auth.js";
import { loadProject } from "../middleware/project.js";
import { mountPayment } from "../utils/razorpay.js";
import { received } from "../utils/money.js";
import { today } from "../utils/today.js";
import { HttpError } from "../utils/errors.js";
import { text, amount } from "../schemas/common.js";

const router = Router({ mergeParams: true });
router.use(requireAuth, loadProject());

const pending = (req, id) => ({ _id: id, projectId: req.project._id, status: "pending" });

// Payment is recorded only once the homeowner has actually paid.
async function markPaid(req, r, patch) {
    const done = await PaymentRequest.findOneAndUpdate(pending(req, r._id), { status: "paid", paidAt: new Date(), ...patch }, { new: true });
    if (!done) return null;
    await Payment.create({ projectId: req.project._id, label: done.label, date: today(), amount: done.amount, method: done.method });
    return done;
}

router.get("/", async (req, res) =>
    res.json(await PaymentRequest.find({ projectId: req.project._id }).sort({ createdAt: -1 }))
);

router.post("/", requireRole("contractor"), async (req, res) => {
    const b = z.object({ label: text(80), amount, note: z.string().trim().max(300).default("") }).parse(req.body);
    if (b.amount > req.project.budget - (await received(req.project._id))) throw new HttpError(400, "Amount exceeds the remaining balance.");
    res.status(201).json(await PaymentRequest.create({ ...b, projectId: req.project._id }));
});

router.post("/:rid/cancel", requireRole("contractor"), async (req, res) => {
    const r = await PaymentRequest.findOneAndUpdate(pending(req, req.params.rid), { status: "cancelled" }, { new: true });
    if (!r) throw new HttpError(409, "This request is no longer open.");
    res.json(r);
});

mountPayment(router, {
    Model: PaymentRequest,
    openFilter: { status: "pending" },
    amountOf: (r) => r.amount,
    prefix: "pr",
    onPaid: (req, r, paymentId) => markPaid(req, r, { method: "razorpay", paymentId }),
});

export default router;
