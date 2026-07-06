import asyncHandler from "../utils/asyncHandler.js";

// Builds standard REST handlers (getAll, getOne, create, update, remove) for a given Mongoose model.
// `publicFilter` lets public GET routes hide unpublished/non-featured content while admin routes see everything.
const crudFactory = (Model, options = {}) => {
  const { publicFilter = {}, sortBy = "order createdAt" } = options;

  const getAll = asyncHandler(async (req, res) => {
    const isAdminRequest = req.query.admin === "true" && req.user;
    const filter = isAdminRequest ? {} : publicFilter;
    const docs = await Model.find(filter).sort(sortBy);
    res.json(docs);
  });

  const getOne = asyncHandler(async (req, res) => {
    const doc = await Model.findById(req.params.id);
    if (!doc) {
      res.status(404);
      throw new Error(`${Model.modelName} not found`);
    }
    res.json(doc);
  });

  const create = asyncHandler(async (req, res) => {
    const doc = await Model.create(req.body);
    res.status(201).json(doc);
  });

  const update = asyncHandler(async (req, res) => {
    const doc = await Model.findByIdAndUpdate(req.params.id, req.body, {
      new: true,
      runValidators: true,
    });
    if (!doc) {
      res.status(404);
      throw new Error(`${Model.modelName} not found`);
    }
    res.json(doc);
  });

  const remove = asyncHandler(async (req, res) => {
    const doc = await Model.findByIdAndDelete(req.params.id);
    if (!doc) {
      res.status(404);
      throw new Error(`${Model.modelName} not found`);
    }
    res.json({ message: `${Model.modelName} removed`, id: req.params.id });
  });

  return { getAll, getOne, create, update, remove };
};

export default crudFactory;
