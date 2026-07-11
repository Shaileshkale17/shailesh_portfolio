import Achievement from "../models/Achievement.js";
import crudService from "./crudService.js";

/** Standard CRUD operations for Achievement, sorted by display order then date. */
export default crudService(Achievement, { sortBy: "order -date" });
