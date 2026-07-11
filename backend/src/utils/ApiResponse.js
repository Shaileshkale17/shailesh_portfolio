/**
 * Standard API response envelope.
 *
 * Every endpoint in this API responds with one of these two shapes so the
 * frontend never has to guess the response format per-route:
 *
 *   Success -> { success: true,  message: string, data: any }
 *   Error   -> { success: false, message: string, error: any }
 *
 * Controllers should only ever use `ApiResponse.success(...)` to send a
 * response. Errors are handled separately by throwing an `AppError` (or any
 * `Error`) and letting the centralized error middleware (see
 * `middlewares/errorMiddleware.js`) build the error envelope — controllers
 * should not construct error responses by hand.
 */
class ApiResponse {
  /**
   * Sends a standardized success response.
   * @param {import("express").Response} res - Express response object.
   * @param {number} [statusCode=200] - HTTP status code.
   * @param {string} [message="Success"] - Human-readable success message.
   * @param {*} [data=null] - Payload to return to the client.
   * @returns {import("express").Response}
   */
  static success(res, statusCode = 200, message = "Success", data = null) {
    return res.status(statusCode).json({
      success: true,
      message,
      data,
    });
  }
}

export default ApiResponse;
