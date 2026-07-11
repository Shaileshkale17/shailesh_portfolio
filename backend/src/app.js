import express from "express";
import cors from "cors";
import cookieParser from "cookie-parser";
import rateLimit from "express-rate-limit";
import { notFound, errorHandler } from "./middlewares/errorMiddleware.js";
import { requestLogger } from "./middlewares/requestLogger.js";

import authRoutes from "./routes/authRoutes.js";
import projectRoutes from "./routes/projectRoutes.js";
import experienceRoutes from "./routes/experienceRoutes.js";
import skillRoutes from "./routes/skillRoutes.js";
import testimonialRoutes from "./routes/testimonialRoutes.js";
import achievementRoutes from "./routes/achievementRoutes.js";
import certificationRoutes from "./routes/certificationRoutes.js";
import messageRoutes from "./routes/messageRoutes.js";
import statsRoutes from "./routes/statsRoutes.js";

/**
 * Express application setup: middleware, routes, and error handling.
 * Exported (rather than started here) so both `index.js` (local/server
 * deployment) and Vercel's serverless handler can import the same app.
 */
const app = express();

// Trust the first proxy hop (Vercel/Nginx) so `req.ip` and rate-limiting
// see the real client IP instead of the proxy's.
app.set("trust proxy", 1);

const allowedOrigins = [
  process.env.CLIENT_ORIGIN,
  process.env.ADMIN_ORIGIN,
].filter(Boolean);

app.use(
  cors({
    // origin: (origin, callback) => {
    //   // Allow requests with no origin (curl, server-to-server, mobile apps).
    //   if (!origin || allowedOrigins.includes(origin)) {
    //     callback(null, true);
    //   } else {
    //     callback(new Error(`CORS blocked for origin: ${origin}`));
    //   }
    // },
    origin: "*",
    credentials: true,
  }),
);

app.use(express.json({ limit: "2mb" }));
app.use(cookieParser());
app.use(requestLogger);

// Basic protection against brute-force/abuse on the API surface.
const limiter = rateLimit({ windowMs: 15 * 60 * 1000, max: 300 });
app.use("/api", limiter);

// Root route — avoids a confusing "Route not found: /" when someone hits
// the bare API URL (Vercel deployment root, uptime checks, browser visits).
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

// Must be registered last: notFound catches unmatched routes, errorHandler
// catches everything (including what notFound just threw).
app.use(notFound);
app.use(errorHandler);

export default app;
