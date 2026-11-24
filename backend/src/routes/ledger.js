
import { z } from "zod";
import LedgerEntry from "../models/LedgerEntry.js";
import { childRouter } from "../utils/childRouter.js";
import { text, amount, dateStr } from "../schemas/common.js";

export default childRouter({
    Model: LedgerEntry,
    who: "homeowner",
    allowDelete: false,
    schema: z.object({
        category: z.enum(["Material", "Labour", "Transport", "Tools & Equipment", "Other"]),
        title: text(120),
        date: dateStr,
        amount,
    }),
});
