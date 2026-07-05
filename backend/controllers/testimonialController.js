const Testimonial = require("../models/Testimonial");
const crudFactory = require("./crudFactory");

module.exports = crudFactory(Testimonial, { publicFilter: { published: true }, sortBy: "order createdAt" });
