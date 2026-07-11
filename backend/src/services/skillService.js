import Skill from "../models/Skill.js";
import crudService from "./crudService.js";

/** Standard CRUD operations for Skill, grouped by category then display order. */
export default crudService(Skill, { sortBy: "category order" });
