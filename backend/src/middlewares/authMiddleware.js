import jwt from "jsonwebtoken";
import asyncHandler from "../utils/asyncHandler.js";
import AppError from "../utils/AppError.js";
import User from "../models/User.js";

/**
 * Authentication middleware — verifies a JWT and attaches the authenticated
 * user to `req.user`.
 *
 * The token is read from either:
 *  1. `Authorization: Bearer <token>` header, or
 *  2. an httpOnly `token` cookie
 *
 * On success, `req.user` is set (password field excluded) and the request
 * continues. On failure, throws a 401 `AppError`, which `asyncHandler`
 * forwards to the centralized error handler.
 */
export const protect = asyncHandler(async (req, res, next) => {
  let token;

  if (req.headers.authorization && req.headers.authorization.startsWith("Bearer")) {
    token = req.headers.authorization.split(" ")[1];
  } else if (req.cookies && req.cookies.token) {
    token = req.cookies.token;
  }

  if (!token) {
    throw new AppError("Not authorized, no token provided", 401);
  }

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    req.user = await User.findById(decoded.id).select("-password");

    if (!req.user) {
      throw new AppError("Not authorized, user not found", 401);
    }

    next();
  } catch (err) {
    if (err instanceof AppError) throw err;
    throw new AppError("Not authorized, token invalid or expired", 401);
  }
});

/**
 * Authorization middleware factory — restricts a route to specific user
 * roles. Must run *after* `protect`, since it relies on `req.user`.
 *
 * @param {...string} roles - Roles allowed to access the route, e.g. "admin", "editor".
 * @returns {import("express").RequestHandler}
 *
 * @example
 * router.post("/", protect, authorize("admin", "editor"), createProject);
 */
export const authorize = (...roles) => {
  return (req, res, next) => {
    if (!req.user || !roles.includes(req.user.role)) {
      throw new AppError("Forbidden: insufficient permissions", 403);
    }
    next();
  };
};

/**
 * Allows a request through if EITHER:
 *   1. it carries a valid `x-cron-secret` header matching `CRON_SECRET`
 *      (for an external scheduler like Vercel Cron hitting the endpoint
 *      directly, with no admin logged in), OR
 *   2. it's an authenticated admin (falls through to `protect` + `authorize("admin")`).
 *
 * Used by `POST /api/integrations/sync` so it can be triggered both
 * manually from the dashboard and by a serverless cron scheduler.
 */
export const allowAdminOrCronSecret = (req, res, next) => {
  const providedSecret = req.headers["x-cron-secret"];
  if (providedSecret && process.env.CRON_SECRET && providedSecret === process.env.CRON_SECRET) {
    return next();
  }
  return protect(req, res, () => authorize("admin")(req, res, next));
};
