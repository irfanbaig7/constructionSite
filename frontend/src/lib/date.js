import { format, parseISO } from "date-fns";

export const formatDate = (iso) => format(parseISO(iso), "d MMM yyyy"); // "2026-08-25" -> "25 Aug 2026"
export const todayKey = () => format(new Date(), "yyyy-MM-dd");