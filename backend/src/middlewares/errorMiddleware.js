import AppError from "../utils/AppError.js";
import logger from "../utils/logger.js";

/**
 * Catches requests that didn't match any route and forwards a 404 AppError
 * to the centralized error handler below. Must be registered *after* all
 * other routes and *before* `errorHandler` in app.js.
 */
export const notFound = (req, res, next) => {
  next(new AppError(`Route not found: ${req.originalUrl}`, 404));
};

/**
 * Centralized Express error-handling middleware.
 *
 * Every error in the app — whether thrown manually as an `AppError` or
 * raised by Mongoose/a third-party library — ends up here (via
 * `asyncHandler` calling `next(err)`, or Express's own error handling).
 * This is the ONLY place that builds an error response, so the shape is
 * guaranteed to always be:
 *
 *   { success: false, message: string, error: object }
 *
 * It also normalizes a few common Mongoose errors into friendly messages
 * and status codes, and logs every error for debugging (full stack for
 * server errors, a shorter line for expected 4xx errors).
 *
 * Must be registered LAST in the middleware chain (it has 4 arguments,
 * which is how Express recognizes an error handler).
 */
export const errorHandler = (err, req, res, next) => {
  let statusCode = err.statusCode || (res.statusCode !== 200 ? res.statusCode : 500);
  let message = err.message || "Something went wrong";

  // Mongoose: invalid ObjectId passed to findById/findByIdAndUpdate/etc.
  if (err.name === "CastError" && err.kind === "ObjectId") {
    statusCode = 404;
    message = "Resource not found";
  }

  // Mongoose: schema validation failed (required field missing, enum mismatch, etc.)
  if (err.name === "ValidationError") {
    statusCode = 400;
    message = Object.values(err.errors)
      .map((validationError) => validationError.message)
      .join(", ");
  }

  // MongoDB: duplicate key on a unique index (e.g. Project.slug, User.email)
  if (err.code === 11000) {
    statusCode = 400;
    const duplicatedField = Object.keys(err.keyValue || {})[0];
    message = duplicatedField
      ? `${duplicatedField} '${err.keyValue[duplicatedField]}' is already in use`
      : "Duplicate field value entered";
  }

  // Log for debugging: full detail for unexpected (5xx) errors, a lighter
  // line for expected (4xx) errors so logs aren't drowned in noise.
  if (statusCode >= 500) {
    logger.error(`${req.method} ${req.originalUrl} -> ${statusCode}`, err);
  } else {
    logger.warn(`${req.method} ${req.originalUrl} -> ${statusCode}: ${message}`);
  }

  res.status(statusCode).json({
    success: false,
    message,
    error: {
      // Stack traces are only useful (and safe) to expose outside production.
      ...(process.env.NODE_ENV !== "production" && { stack: err.stack }),
    },
  });
};
