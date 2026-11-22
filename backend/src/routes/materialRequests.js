import { Router } from "express";
import { z } from "zod";
import Material from "../models/Material.js";
import MaterialRequest from "../models/MaterialRequest.js";
import LedgerEntry from "../models/LedgerEntry.js";
import { requireAuth, requireRole } from "../middleware/auth.js";
import { loadProject } from "../middleware/project.js";
import { mountPayment } from "../utils/razorpay.js";
import { addToStock } from "../utils/materialFlow.js";
import { HttpError } from "../utils/errors.js";
import { today } from "../utils/today.js";
import { text, amount } from "../schemas/common.js";

const OPEN = ["pending", "owner_bringing", "quote_needed", "awaiting_payment"];
const CI = { locale: "en", strength: 2 };
const qty = z.coerce.number().positive("Quantity 0 se zyada honi chahiye.");
const nonNeg = z.coerce.number().min(0).default(0);

const router = Router({ mergeParams: true });
router.use(requireAuth, loadProject());
const contractor = requireRole("contractor");
const homeowner = requireRole("homeowner");

async function find(req, statuses) {
    const r = await MaterialRequest.findOne({ _id: req.params.rid, projectId: req.project._id });
    if (!r) throw new HttpError(404, "Request not found.");
    if (!statuses.includes(r.status)) throw new HttpError(409, "Is request par ab ye kaam nahi ho sakta.");
    return r;
}

router.get("/", async (req, res) =>
    res.json(await MaterialRequest.find({ projectId: req.project._id }).sort({ createdAt: -1 }))
);

// Contractor asks; he never adds material himself.
router.post("/", contractor, async (req, res) => {
    const b = z
        .object({
            name: text(60),
            unit: z.enum(["bags", "pcs", "tons", "kg", "litres", "cft"]),
            quantity: qty,
            note: z.string().trim().max(300).default(""),
            target: nonNeg,
            minStock: nonNeg,
        })
        .parse(req.body);
    const projectId = req.project._id;
    const [existing, clash] = await Promise.all([
        Material.findOne({ projectId, name: b.name }).collation(CI),
        MaterialRequest.findOne({ projectId, name: b.name, status: { $in: OPEN } }).collation(CI),
    ]);
    if (clash) throw new HttpError(409, "Is material ki request pehle se khuli hai.");
    res.status(201).json(await MaterialRequest.create({ ...b, projectId, unit: existing?.unit ?? b.unit }));
});

router.post("/:rid/cancel", contractor, async (req, res) => {
    const r = await find(req, OPEN);
    r.status = "cancelled";
    res.json(await r.save());
});

// Contractor sends a price after the homeowner said "you bring it".
router.post("/:rid/quote", contractor, async (req, res) => {
    const b = z.object({ amount, quantity: qty.optional() }).parse(req.body);
    const r = await find(req, ["quote_needed", "awaiting_payment"]);
    r.set({ amount: b.amount, quantity: b.quantity ?? r.quantity, status: "awaiting_payment", orderId: undefined });
    res.json(await r.save());
});

router.post("/:rid/respond", homeowner, async (req, res) => {
    const { action } = z.object({ action: z.enum(["will_bring", "ask_contractor"]) }).parse(req.body);
    const r = await find(req, ["pending", "owner_bringing"]);
    if (action === "will_bring" && r.status !== "pending") throw new HttpError(409, "Galat action.");
    r.status = action === "will_bring" ? "owner_bringing" : "quote_needed";
    res.json(await r.save());
});

// Homeowner brought it himself: cost goes only to his own notebook.
router.post("/:rid/deliver", homeowner, async (req, res) => {
    const { quantity, amount: spent } = z.object({ quantity: qty, amount: nonNeg }).parse(req.body);
    const r = await find(req, ["pending", "owner_bringing"]);
    const done = await MaterialRequest.findOneAndUpdate(
        { _id: r._id, status: { $in: ["pending", "owner_bringing"] } },
        { status: "fulfilled", source: "owner", deliveredQty: quantity, fulfilledAt: new Date() },
        { new: true }
    );
    if (!done) throw new HttpError(409, "Ye request pehle hi poori ho chuki hai.");
    await addToStock(req.project._id, done, quantity);
    if (spent > 0)
        await LedgerEntry.create({ projectId: req.project._id, category: "Material", title: `${done.name} ${quantity} ${done.unit}`, date: today(), amount: spent, auto: true });
    res.json(done);
});

mountPayment(router, {
    Model: MaterialRequest,
    openFilter: { status: "awaiting_payment" },
    amountOf: (r) => r.amount,
    prefix: "mr",
    onPaid: async (req, r, paymentId) => {
        const done = await MaterialRequest.findOneAndUpdate(
            { _id: r._id, status: "awaiting_payment", orderId: r.orderId },
            { status: "fulfilled", source: "contractor", deliveredQty: r.quantity, paymentId, fulfilledAt: new Date() },
            { new: true }
        );
        if (!done) return null;
        await addToStock(req.project._id, done, done.quantity);
        await LedgerEntry.create({ projectId: req.project._id, category: "Material", title: `${done.name} ${done.quantity} ${done.unit} (contractor ke through)`, date: today(), amount: done.amount, auto: true });
        return done;
    },
});

export default router;