
import { Router } from "express";
import mongoose from "mongoose";
import { z } from "zod";
import Material from "../models/Material.js";
import MaterialRequest from "../models/MaterialRequest.js";
import Project from "../models/Project.js";
import LedgerEntry from "../models/LedgerEntry.js";
import { requireAuth, requireRole } from "../middleware/auth.js";
import { loadProject } from "../middleware/project.js";
import { mountPayment } from "../utils/razorpay.js";
import { addToStock } from "../utils/materialFlow.js";
import { HttpError } from "../utils/errors.js";
import { today } from "../utils/today.js";
import { text, amount } from "../schemas/common.js";

const OPEN = ["pending", "owner_bringing", "quote_needed", "awaiting_payment", "paid_awaiting_delivery"];
const CI = { locale: "en", strength: 2 };
const qty = z.coerce.number().positive("Quantity must be greater than 0.");
const nonNeg = z.coerce.number().min(0).default(0);

const router = Router({ mergeParams: true });
router.use(requireAuth, loadProject());
const contractor = requireRole("contractor");
const homeowner = requireRole("homeowner");

async function find(req, statuses) {
    const r = await MaterialRequest.findOne({ _id: req.params.rid, projectId: req.project._id });
    if (!r) throw new HttpError(404, "Request not found.");
    if (!statuses.includes(r.status)) throw new HttpError(409, "This action is no longer available for this request.");
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
    const request = await mongoose.connection.transaction(async (session) => {
        const lock = await Project.updateOne({ _id: projectId }, { $inc: { materialRequestRevision: 1 } }, { session });
        if (!lock.matchedCount) throw new HttpError(404, "Project not found.");
        const clash = await MaterialRequest.exists({ projectId, name: b.name, status: { $in: OPEN } }).collation(CI).session(session);
        if (clash) throw new HttpError(409, "A request for this material is already open.");
        const existing = await Material.findOne({ projectId, name: b.name }).collation(CI).session(session);
        const [created] = await MaterialRequest.create([{ ...b, projectId, unit: existing?.unit ?? b.unit }], { session });
        return created;
    });
    res.status(201).json(request);
});

router.post("/:rid/cancel", contractor, async (req, res) => {
    const r = await MaterialRequest.findOneAndUpdate(
        { _id: req.params.rid, projectId: req.project._id, status: { $in: OPEN }, orderId: null, paymentId: null },
        { status: "cancelled" }, { returnDocument: "after" },
    );
    if (!r) throw new HttpError(409, "This request is closed or checkout has already started.");
    res.json(r);
});

// Contractor sends a price after the homeowner said "you bring it".
router.post("/:rid/quote", contractor, async (req, res) => {
    const b = z.object({ amount, quantity: qty.optional() }).parse(req.body);
    const r = await find(req, ["quote_needed", "awaiting_payment"]);
    const quoted = await MaterialRequest.findOneAndUpdate(
        { _id: r._id, status: r.status, orderId: null, updatedAt: r.updatedAt },
        { amount: b.amount, quantity: b.quantity ?? r.quantity, status: "awaiting_payment" }, { returnDocument: "after" },
    );
    if (!quoted) throw new HttpError(409, "This quote changed or checkout has already started.");
    res.json(quoted);
});

router.post("/:rid/respond", homeowner, async (req, res) => {
    const { action } = z.object({ action: z.enum(["will_bring", "ask_contractor"]) }).parse(req.body);
    const r = await find(req, ["pending", "owner_bringing"]);
    if (action === "will_bring" && r.status !== "pending") throw new HttpError(409, "Invalid action.");
    const changed = await MaterialRequest.findOneAndUpdate(
        { _id: r._id, status: r.status }, { status: action === "will_bring" ? "owner_bringing" : "quote_needed" },
        { returnDocument: "after" },
    );
    if (!changed) throw new HttpError(409, "This request has changed.");
    res.json(changed);
});

// Homeowner brought it himself: cost goes only to his own notebook.
router.post("/:rid/deliver", homeowner, async (req, res) => {
    const { quantity, amount: spent } = z.object({ quantity: qty, amount: nonNeg }).parse(req.body);
    const done = await recordDelivery(req, ["pending", "owner_bringing"], "owner", quantity, spent);
    res.json(done);
});

router.post("/:rid/contractor-delivery", contractor, async (req, res) => {
    const { quantity } = z.object({ quantity: qty }).parse(req.body);
    res.json(await recordDelivery(req, ["paid_awaiting_delivery"], "contractor", quantity, 0));
});

function recordDelivery(req, statuses, source, quantity, spent) {
    return mongoose.connection.transaction(async (session) => {
        const done = await MaterialRequest.findOneAndUpdate(
            { _id: req.params.rid, projectId: req.project._id, status: { $in: statuses } },
            { status: "fulfilled", source, deliveredQty: quantity, fulfilledAt: new Date() },
            { returnDocument: "after", session },
        );
        if (!done) throw new HttpError(409, "This request is no longer awaiting delivery.");
        await addToStock(req.project._id, done, quantity, session);
        if (spent > 0)
            await LedgerEntry.create([{ projectId: req.project._id, category: "Material", title: `${done.name} ${quantity} ${done.unit}`, date: today(), amount: spent, auto: true }], { session });
        return done;
    });
}

mountPayment(router, {
    Model: MaterialRequest,
    openFilter: { status: "awaiting_payment" },
    amountOf: (r) => r.amount,
    prefix: "mr",
    onPaid: (_req, r, paymentId) => recordMaterialPayment(r, paymentId),
});

export function recordMaterialPayment(r, paymentId) {
    return mongoose.connection.transaction(async (session) => {
        const done = await MaterialRequest.findOneAndUpdate(
            { _id: r._id, status: "awaiting_payment", orderId: r.orderId },
            { status: "paid_awaiting_delivery", source: "contractor", paymentId },
            { returnDocument: "after", session },
        );
        if (!done) return MaterialRequest.findOne({ _id: r._id, paymentId }).session(session);
        await LedgerEntry.create([{ projectId: r.projectId, category: "Material", title: `${done.name} ${done.quantity} ${done.unit} (arranged by contractor)`, date: today(), amount: done.amount, auto: true }], { session });
        return done;
    });
}

export default router;
