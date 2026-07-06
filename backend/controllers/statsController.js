import Stat from "../models/Stat.js";
import crudFactory from "./crudFactory.js";

export default crudFactory(Stat, { sortBy: "order" });
