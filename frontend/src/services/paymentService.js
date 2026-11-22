import { api } from "@/lib/api";

const base = (id) => `/projects/${id}/payment-requests`;
const post = (path, body) => api(path, { method: "POST", body });

export const getPaymentRequests = (id) => api(base(id));
export const createPaymentRequest = (id, body) => post(base(id), body);
export const cancelPaymentRequest = (id, rid) => post(`${base(id)}/${rid}/cancel`, {});
export const createPaymentOrder = (id, rid) => post(`${base(id)}/${rid}/pay/order`, {});
export const verifyPayment = (id, rid, body) => post(`${base(id)}/${rid}/pay/verify`, body);
export const payByCash = (id, rid) => post(`${base(id)}/${rid}/pay/cash`, {});