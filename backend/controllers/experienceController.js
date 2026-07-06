import Experience from "../models/Experience.js";
import crudFactory from "./crudFactory.js";

export default crudFactory(Experience, { sortBy: "order -startDate" });
