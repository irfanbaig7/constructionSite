import { api } from "@/lib/api";

const base = (id) => `/projects/${id}`;
const post = (path, body) => api(path, { method: "POST", body });

// Contractor
export const getMaterials = (id) => api(`${base(id)}/materials`);
export const updateMaterialLimits = (id, materialId, { target, minStock }) =>
    api(`${base(id)}/materials/${materialId}`, { method: "PUT", body: { target, minStock } });
export const createMaterialRequest = (id, body) => post(`${base(id)}/material-requests`, body);
export const quoteRequest = (id, rid, body) => post(`${base(id)}/material-requests/${rid}/quote`, body);
export const confirmContractorDelivery = (id, rid, quantity) => post(`${base(id)}/material-requests/${rid}/contractor-delivery`, { quantity });
export const cancelRequest = (id, rid) => post(`${base(id)}/material-requests/${rid}/cancel`, {});

// Both
export const getMaterialRequests = (id) => api(`${base(id)}/material-requests`);

// Homeowner
export const getOwnerMaterials = getMaterials;
export const respondRequest = (id, rid, action) => post(`${base(id)}/material-requests/${rid}/respond`, { action });
export const deliverRequest = (id, rid, body) => post(`${base(id)}/material-requests/${rid}/deliver`, body);
export const createPayOrder = (id, rid) => post(`${base(id)}/material-requests/${rid}/pay/order`, {});
export const verifyPay = (id, rid, body) => post(`${base(id)}/material-requests/${rid}/pay/verify`, body);
