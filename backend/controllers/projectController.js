import Project from "../models/Project.js";
import crudFactory from "./crudFactory.js";

export default crudFactory(Project, { sortBy: "-featured order createdAt" });
