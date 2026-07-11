import AppError from "./AppError.js";

/**
 * Validates that every field in `requiredFields` is present and non-empty
 * on `payload`. Throws a 400 AppError listing every missing field at once
 * (rather than failing on the first one), so the client gets one useful
 * error message instead of having to fix-and-resubmit repeatedly.
 *
 * This is intentionally simple (no external validation library) since this
 * API only needs "is this field present" checks — Mongoose schema
 * validators (type, enum, min/max, unique) still run as the second line of
 * defense when the document is actually saved.
 *
 * @param {Record<string, unknown>} payload - Usually `req.body`.
 * @param {string[]} requiredFields - Field names that must be present.
 * @throws {AppError} 400 error listing all missing fields.
 *
 * @example
 * validateRequiredFields(req.body, ["title", "issuer"]);
 */
export const validateRequiredFields = (payload = {}, requiredFields = []) => {
  const missingFields = requiredFields.filter((field) => {
    const value = payload[field];
    return value === undefined || value === null || value === "";
  });

  if (missingFields.length > 0) {
    throw new AppError(`Missing required field(s): ${missingFields.join(", ")}`, 400);
  }
};

/**
 * Validates that a value looks like a MongoDB ObjectId (24 hex chars).
 * Lets the route return a clean 400 instead of a Mongoose CastError.
 *
 * @param {string} id
 * @param {string} [resourceName="Resource"]
 * @throws {AppError} 400 error if the id is not a valid ObjectId shape.
 */
export const validateObjectId = (id, resourceName = "Resource") => {
  const isValidObjectId = /^[a-f\d]{24}$/i.test(id);
  if (!isValidObjectId) {
    throw new AppError(`Invalid ${resourceName} id: ${id}`, 400);
  }
};
