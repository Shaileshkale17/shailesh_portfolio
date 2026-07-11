import Stat from "../models/Stat.js";
import crudService from "./crudService.js";

/** Standard CRUD operations for Stat, sorted by display order. */
export default crudService(Stat, { sortBy: "order" });
