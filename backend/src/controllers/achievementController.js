import achievementService from "../services/achievementService.js";
import genericController from "./genericController.js";

/**
 * Achievement controller — standard CRUD handlers for the Achievement
 * resource, built from the generic controller factory.
 */
export default genericController(achievementService, {
  resourceName: "Achievement",
  requiredFieldsOnCreate: ["title"],
});
