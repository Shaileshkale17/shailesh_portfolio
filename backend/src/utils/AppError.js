/**
 * Operational error carrying an HTTP status code.
 *
 * "Operational" errors are expected failure modes (bad input, not found,
 * unauthorized, etc.) as opposed to programmer bugs. Throwing an `AppError`
 * anywhere in a controller or service is safe: `asyncHandler` forwards it to
 * `next()`, and the centralized error middleware (`errorMiddleware.js`)
 * reads `statusCode` off of it to build the response — no route ever needs
 * to touch `res` directly to report a failure.
 */
class AppError extends Error {
  /**
   * @param {string} message - User-facing error message.
   * @param {number} [statusCode=500] - HTTP status code to respond with.
   */
  constructor(message, statusCode = 500) {
    super(message);
    this.statusCode = statusCode;
    this.isOperational = true;
    Error.captureStackTrace(this, this.constructor);
  }
}

export default AppError;
