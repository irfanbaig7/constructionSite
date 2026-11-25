import { z } from "zod";
import { env } from "../config/env.js";
import PaymentRequest from "../models/PaymentRequest.js";
import MaterialRequest from "../models/MaterialRequest.js";
import { assertCapturedPayment, fetchPayment, verifyWebhookSignature } from "../utils/razorpay.js";
import { recordProjectPayment } from "./paymentRequests.js";
import { recordMaterialPayment } from "./materialRequests.js";
import { notifyProject } from "../realtime.js";
import { HttpError } from "../utils/errors.js";

const eventSchema = z.object({ event: z.string() });
const entitySchema = z.object({
    id: z.string().regex(/^pay_[A-Za-z0-9]{1,64}$/),
    order_id: z.string().regex(/^order_[A-Za-z0-9]{1,64}$/),
});

export async function razorpayWebhook(req, res) {
    if (!env.RAZORPAY_WEBHOOK_SECRET) throw new HttpError(503, "Webhook is not configured.");
    if (!verifyWebhookSignature(req.body, req.get("X-Razorpay-Signature"), env.RAZORPAY_WEBHOOK_SECRET))
        throw new HttpError(401, "Invalid webhook signature.");
    let body;
    try {
        body = JSON.parse(req.body.toString("utf8"));
    } catch {
        throw new HttpError(400, "Invalid webhook body.");
    }
    if (eventSchema.parse(body).event !== "payment.captured") return res.sendStatus(204);
    const { id, order_id } = entitySchema.parse(body.payload?.payment?.entity);
    const [projectRequest, materialRequest] = await Promise.all([
        PaymentRequest.findOne({ orderId: order_id }), MaterialRequest.findOne({ orderId: order_id }),
    ]);
    if (projectRequest && materialRequest) throw new HttpError(500, "Order association is ambiguous.");
    const request = projectRequest ?? materialRequest;
    if (!request || request.paymentId === id) return res.sendStatus(204);
    const payment = await fetchPayment(id);
    assertCapturedPayment(payment, { orderId: order_id, paymentId: id, amount: Math.round(request.amount * 100) });
    const record = projectRequest ? recordProjectPayment : recordMaterialPayment;
    if (!(await record(request, id))) throw new HttpError(409, "This payment could not be reconciled.");
    await notifyProject(request.projectId);
    res.sendStatus(204);
}
