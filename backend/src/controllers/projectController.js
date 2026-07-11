import projectService from "../services/projectService.js";
import genericController from "./genericController.js";

/**
 * Project controller — standard CRUD handlers for the Project resource,
 * built from the generic controller factory.
 */
export default genericController(projectService, {
  resourceName: "Project",
  requiredFieldsOnCreate: ["title", "slug", "summary"],
});
