import Achievement from "../models/Achievement.js";
import crudFactory from "./crudFactory.js";

export default crudFactory(Achievement, { sortBy: "order -date" });
