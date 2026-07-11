/**
 * Minimal structured logger.
 *
 * Why this exists instead of raw `console.log` calls scattered everywhere:
 *  - Every line gets a timestamp and a level, so logs are easy to scan/filter
 *    in a hosting dashboard (Vercel logs, PM2, etc.).
 *  - It's a single place to swap in a real logging library (pino/winston)
 *    later without touching every file that logs something.
 *
 * Usage:
 *   import logger from "../utils/logger.js";
 *   logger.info("Server started", { port: 5000 });
 *   logger.error("Failed to connect to DB", err);
 */

const timestamp = () => new Date().toISOString();

/**
 * Formats and prints a log line for the given level.
 * @param {"info"|"warn"|"error"} level
 * @param {string} message - Human-readable message.
 * @param {unknown} [meta] - Optional extra context (object, error, etc.)
 */
const log = (level, message, meta) => {
  const prefix = `[${timestamp()}] [${level.toUpperCase()}]`;

  if (meta === undefined) {
    // eslint-disable-next-line no-console
    console[level === "error" ? "error" : "log"](`${prefix} ${message}`);
    return;
  }

  // eslint-disable-next-line no-console
  console[level === "error" ? "error" : "log"](`${prefix} ${message}`, meta);
};

const logger = {
  info: (message, meta) => log("info", message, meta),
  warn: (message, meta) => log("warn", message, meta),
  error: (message, meta) => log("error", message, meta),
};

export default logger;
