import http from "node:http";
import mongoose from "mongoose";
import app from "./app.js";
import { env } from "./config/env.js";
import { closeRealtime, initRealtime } from "./realtime.js";

process.on("unhandledRejection", (error) => console.error("Unhandled rejection:", error?.name));
process.on("uncaughtException", (error) => {
    console.error("Uncaught exception:", error.name);
    process.exit(1);
});

try {
    await mongoose.connect(env.MONGODB_URI, { serverSelectionTimeoutMS: 10_000 });
    if (env.NODE_ENV === "production") {
        const topology = await mongoose.connection.db.admin().command({ hello: 1 });
        if (!topology.setName && topology.msg !== "isdbgrid") {
            console.error("Production requires a MongoDB replica set or sharded cluster.");
            process.exit(1);
        }
    }
    console.log("MongoDB connected");
} catch (error) {
    console.error("Database startup failed:", error.name);
    process.exit(1);
}

const server = http.createServer(app);
initRealtime(server);
server.listen(env.PORT, () => console.log(`API listening on port ${env.PORT}`));

let stopping = false;
async function stop() {
    if (stopping) return;
    stopping = true;
    const deadline = setTimeout(() => process.exit(1), 15_000).unref();
    try {
        await closeRealtime();
        await mongoose.disconnect();
    } catch (error) {
        console.error("Shutdown failed:", error.name);
        process.exitCode = 1;
    } finally {
        clearTimeout(deadline);
    }
}
process.on("SIGINT", stop);
process.on("SIGTERM", stop);
