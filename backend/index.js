import "dotenv/config";
import express from "express";
import cors from "cors";
import cookieParser from "cookie-parser";
import rateLimit from "express-rate-limit";
import connectDB from "./config/db.js";
import { notFound, errorHandler } from "./middleware/errorMiddleware.js";

import authRoutes from "./routes/authRoutes.js";
import projectRoutes from "./routes/projectRoutes.js";
import experienceRoutes from "./routes/experienceRoutes.js";
import skillRoutes from "./routes/skillRoutes.js";
import testimonialRoutes from "./routes/testimonialRoutes.js";
import achievementRoutes from "./routes/achievementRoutes.js";
import certificationRoutes from "./routes/certificationRoutes.js";
import messageRoutes from "./routes/messageRoutes.js";
import statsRoutes from "./routes/statsRoutes.js";

connectDB();

const app = express();
app.set("trust proxy", 1);

const allowedOrigins = [
  process.env.CLIENT_ORIGIN,
  process.env.ADMIN_ORIGIN,
].filter(Boolean);

app.use(
  cors({
    origin: allowedOrigins.length ? allowedOrigins : "*",
    credentials: true,
  }),
);
app.use(express.json({ limit: "2mb" }));
app.use(cookieParser());

const limiter = rateLimit({ windowMs: 15 * 60 * 1000, max: 300 });
app.use("/api", limiter);

// Root route — fixes "Route not found: /" when someone hits the bare API URL
// (e.g. Vercel deployment root, uptime checks, or just visiting the base URL in a browser).
app.get("/", (req, res) => {
  res.json({
    status: "ok",
    message: "Portfolio API is running",
    health: "/api/health",
  });
});

app.get("/api/health", (req, res) =>
  res.json({ status: "ok", uptime: process.uptime() }),
);

app.use("/api/auth", authRoutes);
app.use("/api/projects", projectRoutes);
app.use("/api/experience", experienceRoutes);
app.use("/api/skills", skillRoutes);
app.use("/api/testimonials", testimonialRoutes);
app.use("/api/achievements", achievementRoutes);
app.use("/api/certifications", certificationRoutes);
app.use("/api/messages", messageRoutes);
app.use("/api/stats", statsRoutes);

app.use(notFound);
app.use(errorHandler);

// When deployed on Vercel, the platform imports this file as a serverless handler
// and calling app.listen() is unnecessary (and harmless to skip).
if (!process.env.VERCEL) {
  const PORT = process.env.PORT || 5000;
  app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
}

export default app;
