import certificationService from "../services/certificationService.js";
import genericController from "./genericController.js";

/**
 * Certification controller — standard CRUD handlers for the Certification
 * resource, built from the generic controller factory.
 */
export default genericController(certificationService, {
  resourceName: "Certification",
  requiredFieldsOnCreate: ["title", "issuer"],
});
