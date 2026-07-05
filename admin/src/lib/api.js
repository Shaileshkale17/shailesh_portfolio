import axios from "axios";

const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL || "http://localhost:5000/api",
});

// Attach the stored JWT to every request once the user is logged in.
api.interceptors.request.use((config) => {
  const token = localStorage.getItem("admin-token");
  if (token) config.headers.Authorization = `Bearer ${token}`;
  return config;
});

// If the token expires or is invalid, bounce back to login.
api.interceptors.response.use(
  (res) => res,
  (err) => {
    if (err.response?.status === 401) {
      localStorage.removeItem("admin-token");
      localStorage.removeItem("admin-user");
      window.location.href = "/login";
    }
    return Promise.reject(err);
  }
);

export default api;
