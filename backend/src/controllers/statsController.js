import statsService from "../services/statsService.js";
import genericController from "./genericController.js";

/**
 * Stats controller — standard CRUD handlers for the Stat resource, built
 * from the generic controller factory.
 */
export default genericController(statsService, {
  resourceName: "Stat",
  requiredFieldsOnCreate: ["label", "value"],
});
