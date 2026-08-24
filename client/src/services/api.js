import axios from "axios";

// Axios instance. In dev, Vite proxies /api to the Node backend
// (VITE_API_URL, default http://localhost:5000).
const api = axios.create({
  baseURL: "/api",
  headers: { "Content-Type": "application/json" },
});

// Attach JWT from localStorage when present (Section 41 auth).
api.interceptors.request.use((config) => {
  const token = localStorage.getItem("bh_token");
  if (token) config.headers.Authorization = `Bearer ${token}`;
  return config;
});

api.interceptors.response.use(
  (res) => res,
  (error) => {
    if (error.response?.status === 401) {
      const token = localStorage.getItem("bh_token");
      const isAuthCall = error.config?.url?.includes("/auth/");
      if (token && !isAuthCall) {
        localStorage.removeItem("bh_token");
        localStorage.removeItem("bh_user");
        window.location.href = "/login";
      }
    }
    return Promise.reject(error);
  }
);

export default api;