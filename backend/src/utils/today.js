// IST date as YYYY-MM-DD. The only place dates are computed.
export const today = (d = new Date()) => d.toLocaleDateString("en-CA", { timeZone: "Asia/Kolkata" });