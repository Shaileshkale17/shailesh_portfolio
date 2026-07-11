import skillService from "../services/skillService.js";
import genericController from "./genericController.js";

/**
 * Skill controller — standard CRUD handlers for the Skill resource, built
 * from the generic controller factory.
 */
export default genericController(skillService, {
  resourceName: "Skill",
  requiredFieldsOnCreate: ["name", "category"],
});
