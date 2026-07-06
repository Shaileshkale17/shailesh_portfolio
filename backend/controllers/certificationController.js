import Certification from "../models/Certification.js";
import crudFactory from "./crudFactory.js";

export default crudFactory(Certification, { sortBy: "order -issueDate" });
