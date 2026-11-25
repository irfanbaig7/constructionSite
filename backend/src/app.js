import { env } from "./config/env.js";
import express from "express";
import cors from "cors";
import helmet from "helmet";
import cookieParser from "cookie-parser";
import rateLimit from "express-rate-limit";
import mongoose from "mongoose";
import { errorHandler } from "./middleware/errorHandler.js";
import { requireRequestOrigin } from "./middleware/requestOrigin.js";
import { requireAuth } from "./middleware/auth.js";
import { loadProject } from "./middleware/project.js";
import { photoDownloadUrl, uploadRoot } from "./config/storage.js";
import auth from "./routes/auth.js";
import workers from "./routes/workers.js";
import projects from "./routes/projects.js";
import updates from "./routes/updates.js";
import updateById from "./routes/updateById.js";
import expenses from "./routes/expenses.js";
import materials from "./routes/materials.js";
import materialRequests from "./routes/materialRequests.js";
import paymentRequests from "./routes/paymentRequests.js";
import workerPayments from "./routes/workerPayments.js";
import ledger from "./routes/ledger.js";
import { razorpayWebhook } from "./routes/razorpayWebhook.js";
import pinoHttp from "pino-http";
import { notifyProject } from "./realtime.js";

const app = express();
app.disable("x-powered-by");
if (env.NODE_ENV === "production") app.set("trust proxy", 1);

app.use(helmet({ crossOriginResourcePolicy: { policy: "same-site" } }));
app.use(cors({ origin: env.CLIENT_ORIGIN, credentials: true }));
app.use(cookieParser());
app.use(pinoHttp({
    level: env.NODE_ENV === "production" ? "info" : "warn",
    redact: ["req.headers", "res.headers", "err"],
}));
app.use(["/api", "/media", "/uploads"], rateLimit({ windowMs: 60_000, limit: 500, standardHeaders: "draft-7", legacyHeaders: false }));
app.post("/api/webhooks/razorpay", express.raw({ type: "application/json", limit: "100kb" }), razorpayWebhook);
app.use("/api", requireRequestOrigin(env.CLIENT_ORIGIN));
app.use(express.json({ limit: "100kb" }));
const photoName = /^[a-f0-9-]{36}\.jpg$/;
const projectPhoto = (req, res, next) => {
    if (!photoName.test(req.params.filename)) return res.sendStatus(404);
    res.set("Cache-Control", "private, no-store");
    next();
};
app.get("/uploads/:projectId/:filename", requireAuth, loadProject(), projectPhoto, (req, res, next) => {
    res.sendFile(`${req.project.id}/${req.params.filename}`, { root: uploadRoot, cacheControl: false }, (error) => {
        if (error?.status === 404) res.sendStatus(404);
        else if (error) next(error);
    });
});
app.get("/media/:projectId/:filename", requireAuth, loadProject(), projectPhoto, (req, res) => {
    res.redirect(photoDownloadUrl(`siteproof/${req.project.id}/${req.params.filename.slice(0, -4)}`));
});
app.get("/api/health", (_req, res) => {
    const ok = mongoose.connection.readyState === 1;
    res.status(ok ? 200 : 503).json({ ok });
});

const routes = {
    "/auth": auth,
    "/workers": workers,
    "/projects": projects,
    "/projects/:projectId/updates": updates,
    "/projects/:projectId/expenses": expenses,
    "/projects/:projectId/materials": materials,
    "/projects/:projectId/material-requests": materialRequests,
    "/projects/:projectId/payment-requests": paymentRequests,
    "/projects/:projectId/worker-payments": workerPayments,
    "/projects/:projectId/ledger": ledger,
    "/updates": updateById,
};

app.use("/api/projects/:projectId", (req, res, next) => {
    if (req.method !== "GET") res.on("finish", () => res.statusCode < 400 && notifyProject(req.params.projectId));
    next();
});

for (const [path, router] of Object.entries(routes)) app.use(`/api${path}`, router);

app.use((_req, res) => res.status(404).json({ message: "Not found." }));
app.use(errorHandler);

export default app;
