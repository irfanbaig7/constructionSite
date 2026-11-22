import Material from "../models/Material.js";
import MaterialRequest from "../models/MaterialRequest.js";
import { today } from "./today.js";
import { HttpError } from "./errors.js";

const CI = { locale: "en", strength: 2 };

export const addToStock = (projectId, request, qty) =>
    Material.findOneAndUpdate(
        { projectId, name: request.name },
        { $inc: { received: qty }, $setOnInsert: { unit: request.unit, target: request.target || 0, minStock: request.minStock || 0 } },
        { upsert: true, new: true, collation: CI }
    );

const adjust = (usage, sign) =>
    Promise.all([...usage].map(([id, q]) => Material.updateOne({ _id: id }, { $inc: { used: sign * q } })));

// Atomically uses stock (never below zero). Rolls back everything if any row fails.
export async function consumeStock(projectId, usage) {
    const done = new Map();
    try {
        for (const [id, qty] of usage) {
            const r = await Material.updateOne(
                { _id: id, projectId, $expr: { $gte: [{ $subtract: ["$received", "$used"] }, qty] } },
                { $inc: { used: qty } }
            );
            if (!r.matchedCount) throw new HttpError(400, "Stock se zyada material use nahi ho sakta.");
            done.set(id, qty);
        }
    } catch (e) {
        await adjust(done, -1);
        throw e;
    }
}

export const restoreStock = (usage) => adjust(usage, -1);

// Update documents as the user's role may see them, plus the materials delivered that day (no prices).
export async function presentUpdates(projectId, updates, role) {
    const fulfilled = await MaterialRequest.find({ projectId, status: "fulfilled" });
    return updates.map((doc) => {
        const u = doc.toJSON();
        if (role === "homeowner") delete u.workerIds;
        u.deliveries = fulfilled
            .filter((r) => today(r.fulfilledAt) === today(u.at))
            .map((r) => ({ name: r.name, unit: r.unit, quantity: r.deliveredQty, by: r.source }));
        return u;
    });
}