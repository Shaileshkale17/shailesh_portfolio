import experienceService from "../services/experienceService.js";
import genericController from "./genericController.js";

/**
 * Experience controller — standard CRUD handlers for the Experience
 * resource, built from the generic controller factory.
 */
export default genericController(experienceService, {
  resourceName: "Experience",
  requiredFieldsOnCreate: ["role", "company", "description"],
});
