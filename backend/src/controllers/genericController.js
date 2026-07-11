import asyncHandler from "../utils/asyncHandler.js";
import ApiResponse from "../utils/ApiResponse.js";
import { validateRequiredFields } from "../utils/validators.js";

/**
 * Adapts a plain CRUD service (no knowledge of Express) into a set of thin
 * Express route handlers. Controllers built this way still do the three
 * things a controller is responsible for — validate input, call into the
 * data layer, return a standardized response — they just do it generically
 * across every simple content resource (Achievement, Certification,
 * Experience, Project, Skill, Stat, Testimonial) instead of repeating the
 * same five handlers nine times.
 *
 * @param {object} service - A service built by `crudService` (see services/crudService.js).
 * @param {object} [options]
 * @param {string} [options.resourceName="Resource"] - Used in response messages, e.g. "Project created successfully".
 * @param {string[]} [options.requiredFieldsOnCreate=[]] - Fields that must be present in the body on create.
 * @param {string[]} [options.requiredFieldsOnUpdate=[]] - Fields that must be present in the body on update, if any are provided.
 * @returns {{ getAll: Function, getOne: Function, create: Function, update: Function, remove: Function }}
 */
const genericController = (service, options = {}) => {
  const { resourceName = "Resource", requiredFieldsOnCreate = [], requiredFieldsOnUpdate = [] } = options;

  /**
   * @route GET /api/<resource>
   * @access Public (returns published/visible items only) — pass ?admin=true while authenticated to see everything
   */
  const getAll = asyncHandler(async (req, res) => {
    const isAdmin = req.query.admin === "true" && Boolean(req.user);
    const docs = await service.getAll({ isAdmin });
    ApiResponse.success(res, 200, `${resourceName} list fetched successfully`, docs);
  });

  /**
   * @route GET /api/<resource>/:id
   * @access Public
   */
  const getOne = asyncHandler(async (req, res) => {
    const doc = await service.getOne(req.params.id);
    ApiResponse.success(res, 200, `${resourceName} fetched successfully`, doc);
  });

  /**
   * @route POST /api/<resource>
   * @access Private (admin/editor)
   */
  const create = asyncHandler(async (req, res) => {
    validateRequiredFields(req.body, requiredFieldsOnCreate);
    const doc = await service.create(req.body);
    ApiResponse.success(res, 201, `${resourceName} created successfully`, doc);
  });

  /**
   * @route PUT /api/<resource>/:id
   * @access Private (admin/editor)
   */
  const update = asyncHandler(async (req, res) => {
    if (requiredFieldsOnUpdate.length > 0) {
      validateRequiredFields(req.body, requiredFieldsOnUpdate);
    }
    const doc = await service.update(req.params.id, req.body);
    ApiResponse.success(res, 200, `${resourceName} updated successfully`, doc);
  });

  /**
   * @route DELETE /api/<resource>/:id
   * @access Private (admin/editor)
   */
  const remove = asyncHandler(async (req, res) => {
    await service.remove(req.params.id);
    ApiResponse.success(res, 200, `${resourceName} deleted successfully`, { id: req.params.id });
  });

  return { getAll, getOne, create, update, remove };
};

export default genericController;
