import assert from "node:assert/strict";
import { createHmac } from "node:crypto";
import { mkdtemp, realpath, rm } from "node:fs/promises";
import { tmpdir } from "node:os";
import { basename, dirname, join } from "node:path";
import test from "node:test";
import mongoose from "mongoose";
import sharp from "sharp";
import { MongoMemoryReplSet } from "mongodb-memory-server-core";

test("contractor and homeowner release journey", { timeout: 600_000 }, async (t) => {
    const tempRoot = await realpath(tmpdir());
    const previousDirectory = process.cwd();
    const database = await MongoMemoryReplSet.create({ replSet: { count: 1 } });
    const directory = await mkdtemp(join(tempRoot, "siteproof-journey-"));
    t.after(async () => {
        await mongoose.disconnect();
        await database.stop();
        process.chdir(previousDirectory);
        const target = await realpath(directory);
        if (dirname(target) === tempRoot && basename(target).startsWith("siteproof-journey-"))
            await rm(target, { recursive: true });
    });
    process.chdir(directory);
    const origin = "http://localhost:3000";
    const paymentSecret = "fixture-payment-secret";
    const webhookSecret = "fixture-webhook-secret";
    Object.assign(process.env, {
        NODE_ENV: "test", MONGODB_URI: database.getUri(), CLIENT_ORIGIN: origin,
        JWT_SECRET: "fixture-secret-unused-by-any-real-environment",
        RAZORPAY_KEY_ID: "rzp_test_fixture", RAZORPAY_KEY_SECRET: paymentSecret,
        RAZORPAY_WEBHOOK_SECRET: webhookSecret,
        CLOUDINARY_CLOUD_NAME: "", CLOUDINARY_API_KEY: "", CLOUDINARY_API_SECRET: "",
        PUBLIC_API_URL: "",
    });
    const { default: app } = await import("../src/app.js");
    await mongoose.connect(process.env.MONGODB_URI);
    for (const model of Object.values(mongoose.models)) await model.init();
    const server = app.listen(0, "127.0.0.1");
    t.after(() => server.close());
    await new Promise((resolve) => server.once("listening", resolve));
    const base = `http://127.0.0.1:${server.address().port}`;

    const browserFetch = globalThis.fetch;
    const orders = new Map();
    const captures = new Map();
    t.mock.method(globalThis, "fetch", async (url, options) => {
        if (url === "https://api.razorpay.com/v1/orders") {
            const { amount, currency } = JSON.parse(options.body);
            const order = { id: `order_fixture${orders.size + 1}`, amount, currency };
            orders.set(order.id, order);
            return Response.json(order);
        }
        if (url.startsWith("https://api.razorpay.com/v1/payments/"))
            return Response.json(captures.get(url.split("/").at(-1)) ?? {}, { status: captures.has(url.split("/").at(-1)) ? 200 : 404 });
        throw new Error("Unexpected provider URL in integration test");
    });

    async function call(path, { cookie, method = "GET", body, expected = 200 } = {}) {
        const form = body instanceof FormData;
        const response = await browserFetch(base + path, {
            method,
            headers: { Origin: origin, ...(cookie && { Cookie: cookie }), ...(body && !form && { "Content-Type": "application/json" }) },
            body: body && !form ? JSON.stringify(body) : body,
        });
        const data = response.headers.get("content-type")?.includes("application/json") ? await response.json() : null;
        assert.equal(response.status, expected, `${method} ${path} ${JSON.stringify(data)}`);
        return { data, cookie: response.headers.get("set-cookie")?.split(";")[0], response };
    }
    const post = (path, cookie, body, expected) => call(path, { method: "POST", cookie, body, expected });
    const get = (path, cookie, expected) => call(path, { cookie, expected });
    const concurrentPost = (path, cookie, bodies) => Promise.all(bodies.map((body) => browserFetch(base + path, {
        method: "POST", headers: { Origin: origin, Cookie: cookie, "Content-Type": "application/json" },
        body: JSON.stringify(body),
    })));
    const signup = (name, email, role) => post("/api/auth/signup", null, { name, email, role, password: "FixturePass123" }, 201);

    await get("/api/health");
    const { cookie: contractor } = await signup("Demo Contractor", "builder@example.test", "contractor");
    const { cookie: other } = await signup("Other Contractor", "other@example.test", "contractor");
    const { cookie: owner } = await signup("Demo Homeowner", "owner@example.test", "homeowner");
    const { data: project } = await post("/api/projects", contractor, {
        name: "Demo Home", owner: "Demo Homeowner", ownerEmail: "owner@example.test", ownerPhone: "9000000000",
        location: "Demo location", budget: 1000, advance: 100, startDate: "2026-01-01", expectedEnd: "2026-12-01",
    }, 201);
    const projectPath = `/api/projects/${project.id}`;
    const { cookie: unrelatedOwner } = await signup("Other Homeowner", "other-owner@example.test", "homeowner");
    assert.deepEqual((await get("/api/projects", owner)).data.map(({ id }) => id), [project.id]);
    assert.deepEqual((await get("/api/projects", unrelatedOwner)).data, []);
    await get(projectPath, unrelatedOwner, 404);
    await get(projectPath, other, 404);
    await get(projectPath, owner);
    await get(`${projectPath}/expenses`, owner, 403);
    await get(`${projectPath}/worker-payments`, owner, 403);

    const { data: worker } = await post("/api/workers", contractor, { name: "Demo Worker", phone: "9000000001" }, 201);
    const { data: expense } = await post(`${projectPath}/expenses`, contractor, {
        title: "Demo refreshments", category: "Food & Chai", amount: 30, date: "2026-11-25",
    }, 201);
    const { data: wage } = await post(`${projectPath}/worker-payments`, contractor, {
        workerId: worker.id, amount: 50, date: "2026-11-25",
    }, 201);
    await call(`${projectPath}/expenses/${expense.id}`, { method: "DELETE", cookie: contractor, expected: 404 });
    await call(`${projectPath}/worker-payments/${wage.id}`, { method: "DELETE", cookie: contractor, expected: 404 });
    assert.equal((await get(`${projectPath}/expenses`, contractor)).data[0].amount, 30);
    assert.equal((await get(`${projectPath}/worker-payments`, contractor)).data[0].amount, 50);
    const materials = `${projectPath}/material-requests`;
    const materialResults = await concurrentPost(materials, contractor,
        ["Cement", "cement"].map((name) => ({ name, unit: "bags", quantity: 5 })));
    assert.deepEqual(materialResults.map(({ status }) => status).sort(), [201, 409]);
    const materialRequest = await materialResults.find(({ status }) => status === 201).json();
    await post(`${materials}/${materialRequest.id}/deliver`, owner, { quantity: 5, amount: 70 });
    const { data: [cement] } = await get(`${projectPath}/materials`, contractor);
    assert.equal(cement.stock, 5);
    const photo = await sharp({ create: { width: 12, height: 12, channels: 3, background: "#123456" } }).jpeg().toBuffer();
    function dailyUpdate(quantity) {
        const form = new FormData();
        form.set("summary", "Demo progress");
        form.set("workerIds", JSON.stringify([worker.id]));
        form.set("materialUsage", JSON.stringify([{ materialId: cement.id, quantity }]));
        form.set("photos", new Blob([photo], { type: "image/jpeg" }), "proof.jpg");
        return form;
    }
    const updates = `${projectPath}/updates`;
    const { data: update } = await post(updates, contractor, dailyUpdate(3), 201);
    await post(updates, contractor, dailyUpdate(3), 400);
    assert.equal((await get(updates, owner)).data.length, 1);
    assert.equal((await get(updates, owner)).data[0].workerIds, undefined);
    assert.equal((await get(`${projectPath}/materials`, contractor)).data[0].stock, 2);
    const photoPath = new URL(update.photos[0].url).pathname;
    assert.equal((await get(photoPath, owner)).response.headers.get("content-type"), "image/jpeg");
    await get(photoPath, other, 404);
    await get(photoPath, null, 401);

    const payments = `${projectPath}/payment-requests`;
    const requests = await concurrentPost(payments, contractor, [1, 2].map(() => ({ label: "Demo installment", amount: 600 })));
    assert.deepEqual(requests.map((response) => response.status).sort(), [201, 400]);
    const request = await requests.find((response) => response.status === 201).json();
    const orderPath = `${payments}/${request.id}/pay/order`;
    const { data: order } = await post(orderPath, owner);
    assert.equal((await post(orderPath, owner)).data.orderId, order.orderId);
    function capture(orderId) {
        const payment = {
            id: `pay_fixture${captures.size + 1}`, order_id: orderId, amount: orders.get(orderId).amount,
            currency: "INR", captured: true, status: "captured", amount_refunded: 0,
        };
        captures.set(payment.id, payment);
        return payment;
    }
    const sign = (secret, text) => createHmac("sha256", secret).update(text).digest("hex");
    const captured = capture(order.orderId);
    const payload = JSON.stringify({ event: "payment.captured", payload: { payment: { entity: captured } } });
    for (let i = 0; i < 2; i++) {
        const response = await browserFetch(base + "/api/webhooks/razorpay", {
            method: "POST", headers: { "Content-Type": "application/json", "X-Razorpay-Signature": sign(webhookSecret, payload) }, body: payload,
        });
        assert.equal(response.status, 204);
    }
    assert.deepEqual((await get(projectPath, owner)).data.payments.map((entry) => entry.amount).sort(), [100, 600]);

    const { data: delivery } = await post(materials, contractor, { name: "Steel", unit: "kg", quantity: 4 }, 201);
    const deliveryPath = `${materials}/${delivery.id}`;
    await post(`${deliveryPath}/respond`, owner, { action: "ask_contractor" });
    await post(`${deliveryPath}/quote`, contractor, { amount: 250 });
    const { data: deliveryOrder } = await post(`${deliveryPath}/pay/order`, owner);
    const paid = capture(deliveryOrder.orderId);
    await post(`${deliveryPath}/pay/verify`, owner, {
        razorpay_order_id: paid.order_id, razorpay_payment_id: paid.id,
        razorpay_signature: sign(paymentSecret, `${paid.order_id}|${paid.id}`),
    });
    assert.equal((await get(`${projectPath}/materials`, contractor)).data.length, 1);
    await post(`${deliveryPath}/contractor-delivery`, contractor, { quantity: 4 });
    assert.equal((await get(`${projectPath}/materials`, contractor)).data.find(({ name }) => name === "Steel").stock, 4);
    assert.deepEqual((await get(`${projectPath}/ledger`, owner)).data.map((entry) => entry.amount).sort((a, b) => a - b), [70, 250]);

    const { cookie: changed } = await call("/api/auth/password", { method: "POST", cookie: owner,
        body: { current: "FixturePass123", next: "AReplacement123" } });
    await get("/api/auth/me", owner, 401);
    await get("/api/auth/me", changed);
    const { cookie: fresh } = await post("/api/auth/login", null, { email: "owner@example.test", password: "AReplacement123" });
    await post("/api/auth/logout", fresh);
    await get("/api/auth/me", fresh, 401);
});
