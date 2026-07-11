import Testimonial from "../models/Testimonial.js";
import crudService from "./crudService.js";

/**
 * Standard CRUD operations for Testimonial. Public reads only see
 * `published: true` testimonials; admin reads see drafts too.
 */
export default crudService(Testimonial, { publicFilter: { published: true }, sortBy: "order createdAt" });
