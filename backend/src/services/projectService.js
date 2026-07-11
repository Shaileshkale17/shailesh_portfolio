import Project from "../models/Project.js";
import crudService from "./crudService.js";

/** Standard CRUD operations for Project, featured projects pinned first. */
export default crudService(Project, { sortBy: "-featured order createdAt" });
