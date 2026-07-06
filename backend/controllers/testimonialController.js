import Testimonial from "../models/Testimonial.js";
import crudFactory from "./crudFactory.js";

export default crudFactory(Testimonial, { publicFilter: { published: true }, sortBy: "order createdAt" });
