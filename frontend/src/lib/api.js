import axios from "axios";

const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL || "http://localhost:5000/api",
});

// Content-fetching helpers used by each section component.
export const fetchStats = () => api.get("/stats").then((r) => r.data.data);
export const fetchSkills = () => api.get("/skills").then((r) => r.data.data);
export const fetchExperience = () =>
  api.get("/experience").then((r) => r.data.data);
export const fetchProjects = () =>
  api.get("/projects").then((r) => r.data.data);
export const fetchTestimonials = () =>
  api.get("/testimonials").then((r) => r.data.data);
export const fetchAchievements = () =>
  api.get("/achievements").then((r) => r.data.data);
export const fetchCertifications = () =>
  api.get("/certifications").then((r) => r.data.data);
export const sendMessage = (payload) =>
  api.post("/messages", payload).then((r) => r.data.data);

export default api;
