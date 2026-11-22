import { env } from "./config/env.js";
import express from "express";
import cors from "cors";
import helmet from "helmet";
import cookieParser from "cookie-parser";
import rateLimit from "express-rate-limit";
import mongoose from "mongoose";
import { errorHandler } from "./middleware/errorHandler.js";
import auth from "./routes/auth.js";
import workers from "./routes/workers.js";
import attendance from "./routes/attendance.js";
import projects from "./routes/projects.js";
import updates from "./routes/updates.js";
import updateById from "./routes/updateById.js";
import expenses from "./routes/expenses.js";
import materials from "./routes/materials.js";
import materialRequests from "./routes/materialRequests.js";
import paymentRequests from "./routes/paymentRequests.js";
import workerPayments from "./routes/workerPayments.js";
import ledger from "./routes/ledger.js";

const app = express();
app.disable("x-powered-by");
if (env.NODE_ENV === "production") app.set("trust proxy", 1);

app.use(helmet({ crossOriginResourcePolicy: { policy: "same-site" } }));
app.use(cors({ origin: env.CLIENT_ORIGIN, credentials: true }));
app.use(cookieParser());
app.use(express.json({ limit: "100kb" }));
app.use("/uploads", express.static("uploads"));
app.use("/api", rateLimit({ windowMs: 60_000, limit: 300, standardHeaders: "draft-7", legacyHeaders: false }));

app.get("/api/health", (_req, res) => res.json({ ok: mongoose.connection.readyState === 1 }));

const routes = {
    "/auth": auth,
    "/workers": workers,
    "/attendance": attendance,
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
for (const [path, router] of Object.entries(routes)) app.use(`/api${path}`, router);

app.use((_req, res) => res.status(404).json({ message: "Not found." }));
app.use(errorHandler);

process.on("unhandledRejection", (e) => console.error("Unhandled rejection:", e));
process.on("uncaughtException", (e) => {
    console.error("Uncaught exception:", e);
    process.exit(1);
});

try {
    await mongoose.connect(env.MONGODB_URI, { serverSelectionTimeoutMS: 10_000 });
    console.log("MongoDB connected");
} catch (e) {
    console.error("DB connection failed:", e.message);
    process.exit(1);
}

const server = app.listen(env.PORT, () => console.log(`API on http://localhost:${env.PORT}`));

async function shutdown() {
    server.close();
    await mongoose.disconnect();
    process.exit(0);
}
process.on("SIGINT", shutdown);
process.on("SIGTERM", shutdown);