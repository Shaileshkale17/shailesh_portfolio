const Certification = require("../models/Certification");
const crudFactory = require("./crudFactory");

module.exports = crudFactory(Certification, { sortBy: "order -issueDate" });
