
import { z } from "zod";
import LedgerEntry from "../models/LedgerEntry.js";
import { childRouter } from "../utils/childRouter.js";
import { text, amount, dateStr } from "../schemas/common.js";

export default childRouter({
    Model: LedgerEntry,
    who: "homeowner",
    deleteFilter: { auto: { $ne: true } }, // app-created entries cannot be deleted
    missing: "Entry not found or cannot be deleted.",
    schema: z.object({
        category: z.enum(["Material", "Labour", "Transport", "Tools & Equipment", "Other"]),
        title: text(120),
        date: dateStr,
        amount,
    }),
});
