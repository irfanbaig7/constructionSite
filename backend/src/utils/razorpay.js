import crypto from "crypto";
import { z } from "zod";
import { env } from "../config/env.js";
import { HttpError } from "./errors.js";
import { requireRole } from "../middleware/auth.js";

function credentials() {
    if (!env.RAZORPAY_KEY_ID || !env.RAZORPAY_KEY_SECRET) throw new HttpError(503, "Payments abhi set up nahi hain.");
    if (!env.RAZORPAY_KEY_ID.startsWith("rzp_test_")) throw new HttpError(503, "Only test payments are enabled.");
    return Buffer.from(`${env.RAZORPAY_KEY_ID}:${env.RAZORPAY_KEY_SECRET}`).toString("base64");
}

export function verifyWebhookSignature(raw, signature, secret) {
    if (!Buffer.isBuffer(raw) || !/^[a-fA-F0-9]{64}$/.test(signature ?? "")) return false;
    const expected = crypto.createHmac("sha256", secret).update(raw).digest();
    return crypto.timingSafeEqual(expected, Buffer.from(signature, "hex"));
}

async function createOrder(rupees, receipt) {
    try {
        const response = await fetch("https://api.razorpay.com/v1/orders", {
            method: "POST",
            signal: AbortSignal.timeout(15_000),
            headers: {
                Authorization: `Basic ${credentials()}`,
                "Content-Type": "application/json",
            },
            body: JSON.stringify({ amount: Math.round(rupees * 100), currency: "INR", receipt: receipt.slice(0, 40) }),
        });
        const o = await response.json().catch(() => ({}));
        if (!response.ok) throw new Error(o.error?.description || `Razorpay returned ${response.status}`);
        return { orderId: o.id, amount: o.amount, currency: o.currency, keyId: env.RAZORPAY_KEY_ID };
    } catch (e) {
        if (e instanceof HttpError) throw e;
        console.error("RAZORPAY:", e?.error?.description || e?.message || e);
        throw new HttpError(502, "Payment shuru nahi ho paya. Thodi der baad try karo.");
    }
}

const checkout = z.object({
    razorpay_order_id: z.string().regex(/^order_[A-Za-z0-9]{1,64}$/),
    razorpay_payment_id: z.string().regex(/^pay_[A-Za-z0-9]{1,64}$/),
    razorpay_signature: z.string().regex(/^[a-fA-F0-9]{64}$/),
});

function verifySignature(orderId, { razorpay_order_id, razorpay_payment_id, razorpay_signature }) {
    if (!orderId || razorpay_order_id !== orderId) throw new HttpError(400, "Order match nahi hua.");
    const expected = crypto.createHmac("sha256", env.RAZORPAY_KEY_SECRET).update(`${razorpay_order_id}|${razorpay_payment_id}`).digest();
    const given = Buffer.from(razorpay_signature, "hex");
    if (given.length !== expected.length || !crypto.timingSafeEqual(expected, given))
        throw new HttpError(400, "Payment verify nahi hua.");
}

export function assertCapturedPayment(payment, { orderId, paymentId, amount }) {
    if (payment.id !== paymentId || payment.order_id !== orderId || payment.amount !== amount || payment.currency !== "INR")
        throw new HttpError(400, "Payment details do not match this request.");
    if (payment.status !== "captured" || payment.captured !== true || payment.amount_refunded !== 0)
        throw new HttpError(409, "Payment has not been captured in full.");
}

export async function fetchPayment(paymentId) {
    const authorization = credentials();
    try {
        const response = await fetch(`https://api.razorpay.com/v1/payments/${paymentId}`, {
            signal: AbortSignal.timeout(15_000),
            headers: { Authorization: `Basic ${authorization}` },
        });
        if (!response.ok) throw new Error("Payment lookup failed.");
        return await response.json();
    } catch {
        throw new HttpError(502, "Payment status could not be checked. Please try again.");
    }
}

// Adds POST /:rid/pay/order and /:rid/pay/verify to a router that already has req.project.
// onPaid(req, doc, paymentId) must claim the document atomically and return the updated doc (or null if already done).
export function mountPayment(router, { Model, openFilter, amountOf, prefix, onPaid }) {
    const open = async (req) => {
        const doc = await Model.findOne({ _id: req.params.rid, projectId: req.project._id, ...openFilter });
        if (!doc) throw new HttpError(409, "Ye request ab khuli nahi hai.");
        return doc;
    };

    router.post("/:rid/pay/order", requireRole("homeowner"), async (req, res) => {
        const doc = await open(req);
        credentials();
        if (doc.orderId) return res.json({ orderId: doc.orderId, amount: Math.round(amountOf(doc) * 100), currency: "INR", keyId: env.RAZORPAY_KEY_ID });
        const order = await createOrder(amountOf(doc), `${prefix}_${doc.id}`);
        const claimed = await Model.updateOne(
            { _id: doc._id, projectId: req.project._id, ...openFilter, orderId: null, amount: amountOf(doc), updatedAt: doc.updatedAt },
            { $set: { orderId: order.orderId } },
        );
        if (!claimed.matchedCount) throw new HttpError(409, "This request changed. Refresh and try again.");
        res.json(order);
    });

    router.post("/:rid/pay/verify", requireRole("homeowner"), async (req, res) => {
        credentials();
        const body = checkout.parse(req.body);
        const doc = await Model.findOne({ _id: req.params.rid, projectId: req.project._id, orderId: body.razorpay_order_id });
        if (!doc) throw new HttpError(409, "This order is no longer available.");
        verifySignature(doc.orderId, body);
        if (doc.paymentId === body.razorpay_payment_id) return res.json(doc);
        const payment = await fetchPayment(body.razorpay_payment_id);
        assertCapturedPayment(payment, { orderId: doc.orderId, paymentId: body.razorpay_payment_id, amount: Math.round(amountOf(doc) * 100) });
        const done = await onPaid(req, doc, body.razorpay_payment_id);
        if (!done) throw new HttpError(409, "This payment request changed. Refresh to check its status.");
        res.json(done);
    });
}
