/**
 * Wraps an async Express route/middleware handler so that any rejected
 * promise (thrown error, failed await, etc.) is forwarded to `next(err)`
 * instead of crashing the process or hanging the request.
 *
 * Without this, every controller would need its own try/catch that calls
 * `next(err)` manually. With it, controllers can simply `throw` (e.g.
 * `throw new AppError(...)`) and the centralized error middleware handles
 * the rest.
 *
 * @param {(req: import("express").Request, res: import("express").Response, next: import("express").NextFunction) => Promise<unknown>} fn
 * @returns {(req: import("express").Request, res: import("express").Response, next: import("express").NextFunction) => void}
 *
 * @example
 * export const getProject = asyncHandler(async (req, res) => {
 *   const project = await projectService.getOne(req.params.id);
 *   ApiResponse.success(res, 200, "Project fetched successfully", project);
 * });
 */
const asyncHandler = (fn) => (req, res, next) => Promise.resolve(fn(req, res, next)).catch(next);

export default asyncHandler;
