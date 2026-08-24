import api from "./api";

// ---- Auth ----
export const login = (email, password) => api.post("/auth/login", { email, password }).then((r) => r.data);
export const getMe = () => api.get("/auth/me").then((r) => r.data);

// ---- Dashboard (Section 33) ----
export const getDashboardSummary = () => api.get("/dashboard/summary").then((r) => r.data);

// ---- Risk / GIS (Sections 11, 12, 27) ----
export const getRiskZones = (params) => api.get("/risk/zones", { params }).then((r) => r.data);
export const getRiskZone = (id) => api.get(`/risk/zones/${id}`).then((r) => r.data);
export const getHeatmap = () => api.get("/risk/heatmap").then((r) => r.data);
export const getRiskTrends = (hours = 48) => api.get("/risk/trends", { params: { hours } }).then((r) => r.data);

// ---- Weather ----
export const getWeather = () => api.get("/weather").then((r) => r.data);

// ---- Sensors ----
export const getSensors = () => api.get("/sensors").then((r) => r.data);

// ---- Reports (Section 28) ----
export const getReports = (params) => api.get("/reports", { params }).then((r) => r.data);
export const createReport = (payload) => api.post("/reports", payload).then((r) => r.data);

// ---- Alerts (Section 30) ----
export const getAlerts = (params) => api.get("/alerts", { params }).then((r) => r.data);
export const acknowledgeAlert = (id) => api.patch(`/alerts/${id}/acknowledge`).then((r) => r.data);

// ---- Roads (Section 32) ----
export const getRoads = () => api.get("/roads").then((r) => r.data);
export const updateRoadStatus = (id, status) => api.patch(`/roads/${id}/status`, { status }).then((r) => r.data);

// ---- ML (Sections 23, 47 P7) ----
export const predictRisk = (features) => api.post("/ml/predict", features).then((r) => r.data);