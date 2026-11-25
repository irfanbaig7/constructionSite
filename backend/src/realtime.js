import { Server } from "socket.io";
import { parseCookie as parse } from "cookie";
import { authenticateSession } from "./middleware/auth.js";
import Project from "./models/Project.js";
import { env } from "./config/env.js";

let io;

// Same httpOnly cookie as the REST API, so there is no second token.
export function initRealtime(server) {
    io = new Server(server, {
        cors: { origin: env.CLIENT_ORIGIN, credentials: true },
        allowRequest: (req, callback) => callback(null, !req.headers.origin || req.headers.origin === env.CLIENT_ORIGIN),
    });

    io.use(async (socket, next) => {
        try {
            socket.data.session = await authenticateSession(parse(socket.handshake.headers.cookie ?? "").sp_token);
            next();
        } catch {
            next(new Error("unauthorized"));
        }
    });

    io.on("connection", (s) => {
        const { user, id, expiresAt } = s.data.session;
        s.join(`user:${user.id}`);
        s.join(`session:${id}`);
        if (user.role === "homeowner")
            s.join(`email:${user.email}`);
        const expiry = setTimeout(() => s.disconnect(true), Math.max(0, expiresAt - Date.now()));
        s.once("disconnect", () => clearTimeout(expiry));
    });
}

export function disconnectUser(userId) {
    io?.in(`user:${userId}`).disconnectSockets(true);
}

export function disconnectSession(id) {
    io?.in(`session:${id}`).disconnectSockets(true);
}

export async function closeRealtime() {
    if (io) await io.close();
    io = undefined;
}

// Tells both sides of a project (contractor and homeowner) that something changed.
export async function notifyProject(projectId) {
    if (!io) return;
    const p = await Project.findById(projectId).select("contractorId ownerEmail").catch(() => null);
    if (p) io.to(`user:${p.contractorId}`).to(`email:${p.ownerEmail}`).emit("changed");
}
