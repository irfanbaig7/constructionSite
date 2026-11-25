import assert from "node:assert/strict";
import { createHmac } from "node:crypto";
import test from "node:test";
import express from "express";

process.env.NODE_ENV = "test";
process.env.MONGODB_URI = "mongodb://127.0.0.1:27017/unused";
process.env.JWT_SECRET = "non-secret-test-string-for-unit-tests";
process.env.CLIENT_ORIGIN = "https://siteproof.example.test";
process.env.RAZORPAY_WEBHOOK_SECRET = "test-webhook-secret";

const { requireRequestOrigin } = await import("../src/middleware/requestOrigin.js");
const { scopeOf } = await import("../src/middleware/project.js");
const { authenticateSession } = await import("../src/middleware/auth.js");
const { assertCapturedPayment, verifyWebhookSignature } = await import("../src/utils/razorpay.js");
const { tokenHash, newAccountToken } = await import("../src/utils/accountEmail.js");
const { productionConfigErrors } = await import("../src/config/env.js");
const { default: app } = await import("../src/app.js");

test("API rejects anonymous project and photo requests, forged webhooks and cross-origin writes", async (t) => {
    const server = app.listen(0, "127.0.0.1");
    t.after(() => server.close());
    await new Promise((resolve) => server.once("listening", resolve));
    const base = `http://127.0.0.1:${server.address().port}`;
    const project = "000000000000000000000000";
    const photo = "00000000-0000-0000-0000-000000000000.jpg";
    for (const path of ["/api/projects", `/api/projects/${project}/expenses`, `/media/${project}/${photo}`, `/uploads/${project}/${photo}`])
        assert.equal((await fetch(base + path)).status, 401, path);
    assert.equal((await fetch(base + "/api/health")).status, 503);
    assert.equal((await fetch(base + "/api/auth/logout", { method: "POST", headers: { Origin: "https://other.example.test" } })).status, 403);
    assert.equal((await fetch(base + "/api/webhooks/razorpay", {
        method: "POST", headers: { "Content-Type": "application/json", "X-Razorpay-Signature": "invalid" },
        body: '{"event":"payment.captured"}',
    })).status, 401);
});

test("production requires HTTPS, provider settings and Razorpay test mode", () => {
    const config = {
        NODE_ENV: "production", CLIENT_ORIGIN: "https://app.example.test", PUBLIC_API_URL: "https://api.example.test",
        RESEND_API_KEY: "set", AUTH_EMAIL_FROM: "set", CLOUDINARY_CLOUD_NAME: "set", CLOUDINARY_API_KEY: "set",
        CLOUDINARY_API_SECRET: "set", RAZORPAY_KEY_ID: "rzp_test_example", RAZORPAY_KEY_SECRET: "set",
        RAZORPAY_WEBHOOK_SECRET: "set",
    };
    assert.deepEqual(productionConfigErrors(config), []);
    assert.deepEqual(productionConfigErrors({ ...config, RAZORPAY_KEY_ID: "rzp_live_example" }), ["RAZORPAY_KEY_ID must be a test-mode key"]);
    assert.ok(productionConfigErrors({ ...config, PUBLIC_API_URL: "http://localhost:5000/api", RESEND_API_KEY: "" }).length === 2);
});

test("project queries deny unverified homeowners and isolate each role", () => {
    assert.deepEqual(scopeOf({ role: "homeowner", email: "owner@example.test" }), { ownerEmail: { $in: [] } });
    assert.deepEqual(scopeOf({ role: "homeowner", email: "owner@example.test", emailVerifiedAt: new Date() }), { ownerEmail: "owner@example.test" });
    assert.deepEqual(scopeOf({ role: "contractor", _id: "contractorA" }), { contractorId: "contractorA" });
});

test("missing and invalid session tokens return 401 before database access", async () => {
    await assert.rejects(authenticateSession(), { status: 401 });
    await assert.rejects(authenticateSession("invalid"), { status: 401 });
});

test("state-changing HTTP routes require the configured website origin", async (t) => {
    const app = express();
    const origin = "https://siteproof.example.test";
    app.use(requireRequestOrigin(origin));
    app.all("/resource", (_req, res) => res.sendStatus(204));
    app.use((err, _req, res, _next) => res.sendStatus(err.status));
    const server = app.listen(0, "127.0.0.1");
    t.after(() => server.close());
    await new Promise((resolve) => server.once("listening", resolve));
    const url = `http://127.0.0.1:${server.address().port}/resource`;
    assert.equal((await fetch(url)).status, 204);
    assert.equal((await fetch(url, { method: "POST" })).status, 403);
    assert.equal((await fetch(url, { method: "POST", headers: { Origin: "https://other.example.test" } })).status, 403);
    assert.equal((await fetch(url, { method: "POST", headers: { Origin: origin } })).status, 204);
});

test("email tokens are random and only their digest is persisted", () => {
    const token = newAccountToken();
    assert.match(token, /^[a-f0-9]{64}$/);
    assert.notEqual(token, newAccountToken());
    assert.notEqual(token, tokenHash(token));
    assert.equal(tokenHash(token), tokenHash(token));
});

test("capture requires a matching order, exact INR paise and the full captured amount", () => {
    const expected = { orderId: "order_abc", paymentId: "pay_abc", amount: 2050 };
    const captured = { order_id: "order_abc", id: "pay_abc", amount: 2050, currency: "INR", status: "captured", captured: true, amount_refunded: 0 };
    assert.doesNotThrow(() => assertCapturedPayment(captured, expected));
    for (const invalid of [{ amount: 2049 }, { currency: "USD" }, { order_id: "order_other" }, { id: "pay_other" }])
        assert.throws(() => assertCapturedPayment({ ...captured, ...invalid }, expected), { status: 400 });
    for (const invalid of [{ status: "authorized" }, { captured: false }, { amount_refunded: 100 }])
        assert.throws(() => assertCapturedPayment({ ...captured, ...invalid }, expected), { status: 409 });
});

test("webhook signatures cover the exact raw payload", () => {
    const secret = "test-webhook-secret";
    const body = Buffer.from('{"event":"payment.captured"}');
    const signature = createHmac("sha256", secret).update(body).digest("hex");
    assert.equal(verifyWebhookSignature(body, signature, secret), true);
    assert.equal(verifyWebhookSignature(Buffer.concat([body, Buffer.from(" ")]), signature, secret), false);
    assert.equal(verifyWebhookSignature(body, "invalid", secret), false);
});
