import Skill from "../models/Skill.js";
import crudFactory from "./crudFactory.js";

export default crudFactory(Skill, { sortBy: "category order" });
