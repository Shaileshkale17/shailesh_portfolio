import Certification from "../models/Certification.js";
import crudService from "./crudService.js";

/** Standard CRUD operations for Certification, sorted by display order then issue date. */
export default crudService(Certification, { sortBy: "order -issueDate" });
