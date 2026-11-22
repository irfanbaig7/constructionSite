import crypto from "crypto";
import Razorpay from "razorpay";
import { env } from "../config/env.js";
import { HttpError } from "./errors.js";
import { requireRole } from "../middleware/auth.js";

let client;
function rz() {
    if (!env.RAZORPAY_KEY_ID || !env.RAZORPAY_KEY_SECRET) throw new HttpError(503, "Payments abhi set up nahi hain.");
    return (client ??= new Razorpay({ key_id: env.RAZORPAY_KEY_ID, key_secret: env.RAZORPAY_KEY_SECRET }));
}

async function createOrder(rupees, receipt) {
    try {
        const o = await rz().orders.create({ amount: Math.round(rupees * 100), currency: "INR", receipt: receipt.slice(0, 40) });
        return { orderId: o.id, amount: o.amount, currency: o.currency, keyId: env.RAZORPAY_KEY_ID };
    } catch (e) {
        if (e instanceof HttpError) throw e;
        console.error("RAZORPAY:", e?.error?.description || e?.message || e);
        throw new HttpError(502, "Payment shuru nahi ho paya. Thodi der baad try karo.");
    }
}

function verifySignature(orderId, { razorpay_order_id, razorpay_payment_id, razorpay_signature } = {}) {
    if (!orderId || razorpay_order_id !== orderId) throw new HttpError(400, "Order match nahi hua.");
    const expected = crypto.createHmac("sha256", env.RAZORPAY_KEY_SECRET ?? "").update(`${razorpay_order_id}|${razorpay_payment_id}`).digest();
    const given = Buffer.from(String(razorpay_signature ?? ""), "hex");
    if (given.length !== expected.length || !crypto.timingSafeEqual(expected, given))
        throw new HttpError(400, "Payment verify nahi hua.");
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
        const order = await createOrder(amountOf(doc), `${prefix}_${doc.id}`);
        doc.orderId = order.orderId;
        await doc.save();
        res.json(order);
    });

    router.post("/:rid/pay/verify", requireRole("homeowner"), async (req, res) => {
        const doc = await open(req);
        verifySignature(doc.orderId, req.body);
        res.json((await onPaid(req, doc, req.body.razorpay_payment_id)) ?? doc);
    });
}