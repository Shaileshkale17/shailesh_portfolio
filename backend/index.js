import dotenv from "dotenv";
dotenv.config();

import connectDB from "./src/config/db.js";
import app from "./src/app.js";
import logger from "./src/utils/logger.js";

// Catch anything that slips past Express's error handling entirely, so a
// stray unhandled rejection/exception is logged instead of crashing silently.
process.on("unhandledRejection", (reason) => {
  logger.error("Unhandled Rejection", reason);
});
process.on("uncaughtException", (err) => {
  logger.error("Uncaught Exception", err);
});

await connectDB();

// When deployed on Vercel, the platform imports this file as a serverless
// handler and calling app.listen() is unnecessary (and harmless to skip).
if (!process.env.VERCEL) {
  const PORT = process.env.PORT || 5000;
  app.listen(PORT, () => logger.info(`Server running on port ${PORT}`));
}

export default app;
