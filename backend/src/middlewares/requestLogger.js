import logger from "../utils/logger.js";

/**
 * Logs every incoming request's method, path, status code, and duration
 * once it finishes. Registered early in `app.js` so it wraps every route.
 *
 * This is intentionally dependency-free (no morgan) to keep the project's
 * footprint small, but is a drop-in place to swap in morgan/pino-http later
 * if request logs need to be more detailed (IP, user-agent, etc.).
 */
export const requestLogger = (req, res, next) => {
  const startTime = process.hrtime.bigint();

  res.on("finish", () => {
    const durationMs = Number(process.hrtime.bigint() - startTime) / 1e6;
    logger.info(`${req.method} ${req.originalUrl} -> ${res.statusCode} (${durationMs.toFixed(1)}ms)`);
  });

  next();
};
