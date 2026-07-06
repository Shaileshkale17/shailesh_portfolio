require("dotenv").config();
const express = require("express");
const cors = require("cors");
const cookieParser = require("cookie-parser");
const rateLimit = require("express-rate-limit");
const connectDB = require("./config/db");
const { notFound, errorHandler } = require("./middleware/errorMiddleware");

const authRoutes = require("./routes/authRoutes");
const projectRoutes = require("./routes/projectRoutes");
const experienceRoutes = require("./routes/experienceRoutes");
const skillRoutes = require("./routes/skillRoutes");
const testimonialRoutes = require("./routes/testimonialRoutes");
const achievementRoutes = require("./routes/achievementRoutes");
const certificationRoutes = require("./routes/certificationRoutes");
const messageRoutes = require("./routes/messageRoutes");
const statsRoutes = require("./routes/statsRoutes");

connectDB();

const app = express();

const allowedOrigins = [process.env.CLIENT_ORIGIN, process.env.ADMIN_ORIGIN].filter(Boolean);

app.use(
  cors({
    origin: allowedOrigins.length ? allowedOrigins : "*",
    credentials: true,
  })
);
app.use(express.json({ limit: "2mb" }));
app.use(cookieParser());

const limiter = rateLimit({ windowMs: 15 * 60 * 1000, max: 300 });
app.use("/api", limiter);

app.get("/api/health", (req, res) => res.json({ status: "ok", uptime: process.uptime() }));

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

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
