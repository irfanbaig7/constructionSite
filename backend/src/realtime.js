import { Server } from "socket.io";
import { parseCookie as parse } from "cookie";
import jwt from "jsonwebtoken";
import User from "./models/User.js";
import Project from "./models/Project.js";
import { env } from "./config/env.js";

let io;

// Same httpOnly cookie as the REST API, so there is no second token.
export function initRealtime(server) {
    io = new Server(server, { cors: { origin: env.CLIENT_ORIGIN, credentials: true } });

    io.use(async (socket, next) => {
        try {
            const { id, v } = jwt.verify(parse(socket.handshake.headers.cookie ?? "").sp_token, env.JWT_SECRET);
            const user = await User.findById(id);
            if (!user || user.tokenVersion !== v) throw new Error("stale");
            socket.data.user = user;
            next();
        } catch {
            next(new Error("unauthorized"));
        }
    });

    io.on("connection", (s) => {
        s.join(`user:${s.data.user.id}`);
        s.join(`email:${s.data.user.email}`);
    });
}

// Tells both sides of a project (contractor and homeowner) that something changed.
export async function notifyProject(projectId) {
    if (!io) return;
    const p = await Project.findById(projectId).select("contractorId ownerEmail").catch(() => null);
    if (p) io.to(`user:${p.contractorId}`).to(`email:${p.ownerEmail}`).emit("changed");
}