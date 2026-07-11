import AppError from "../utils/AppError.js";

/**
 * Builds a standard set of CRUD operations for a given Mongoose model.
 *
 * This is pure business logic: it knows nothing about Express (no req/res),
 * which makes it reusable across controllers and independently testable.
 * Each content-type service (achievementService, projectService, etc.) is
 * just this factory called with model-specific sort/filter options.
 *
 * @param {import("mongoose").Model} Model - The Mongoose model to operate on.
 * @param {object} [options]
 * @param {object} [options.publicFilter={}] - Extra filter applied for non-admin reads
 *   (e.g. `{ published: true }` for testimonials), so drafts/unpublished
 *   content stays hidden from the public site.
 * @param {string} [options.sortBy="order createdAt"] - Mongoose sort string.
 * @returns {{
 *   getAll: (opts?: { isAdmin?: boolean }) => Promise<import("mongoose").Document[]>,
 *   getOne: (id: string) => Promise<import("mongoose").Document>,
 *   create: (data: object) => Promise<import("mongoose").Document>,
 *   update: (id: string, data: object) => Promise<import("mongoose").Document>,
 *   remove: (id: string) => Promise<import("mongoose").Document>,
 * }}
 */
const crudService = (Model, options = {}) => {
  const { publicFilter = {}, sortBy = "order createdAt" } = options;

  /**
   * Fetches all documents. Admin reads (`isAdmin: true`) see everything;
   * public reads are narrowed by `publicFilter`.
   */
  const getAll = async ({ isAdmin = false } = {}) => {
    const filter = isAdmin ? {} : publicFilter;
    return Model.find(filter).sort(sortBy);
  };

  /** Fetches a single document by id, or throws 404 if it doesn't exist. */
  const getOne = async (id) => {
    const doc = await Model.findById(id);
    if (!doc) throw new AppError(`${Model.modelName} not found`, 404);
    return doc;
  };

  /** Creates a new document. Mongoose schema validation runs automatically. */
  const create = async (data) => Model.create(data);

  /**
   * Updates a document by id, running schema validators on the update.
   * Throws 404 if the document doesn't exist.
   */
  const update = async (id, data) => {
    const doc = await Model.findByIdAndUpdate(id, data, {
      new: true,
      runValidators: true,
    });
    if (!doc) throw new AppError(`${Model.modelName} not found`, 404);
    return doc;
  };

  /** Deletes a document by id. Throws 404 if it doesn't exist. */
  const remove = async (id) => {
    const doc = await Model.findByIdAndDelete(id);
    if (!doc) throw new AppError(`${Model.modelName} not found`, 404);
    return doc;
  };

  return { getAll, getOne, create, update, remove };
};

export default crudService;
