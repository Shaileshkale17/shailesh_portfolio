import Experience from "../models/Experience.js";
import crudService from "./crudService.js";

/** Standard CRUD operations for Experience, sorted by display order then start date. */
export default crudService(Experience, { sortBy: "order -startDate" });
