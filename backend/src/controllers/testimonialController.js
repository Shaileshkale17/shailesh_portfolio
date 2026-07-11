import testimonialService from "../services/testimonialService.js";
import genericController from "./genericController.js";

/**
 * Testimonial controller — standard CRUD handlers for the Testimonial
 * resource, built from the generic controller factory.
 */
export default genericController(testimonialService, {
  resourceName: "Testimonial",
  requiredFieldsOnCreate: ["author", "quote"],
});
