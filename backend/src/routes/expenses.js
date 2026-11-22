import { z } from "zod";
import Expense from "../models/Expense.js";
import { childRouter } from "../utils/childRouter.js";
import { text, amount, dateStr } from "../schemas/common.js";

export default childRouter({
    Model: Expense,
    who: "contractor",
    missing: "Expense not found.",
    schema: z.object({
        category: z.enum(["Tools & Equipment", "Transport", "Food & Chai", "Other"]),
        title: text(120),
        date: dateStr,
        amount,
    }),
});