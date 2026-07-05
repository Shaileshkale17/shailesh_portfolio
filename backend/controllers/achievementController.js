const Achievement = require("../models/Achievement");
const crudFactory = require("./crudFactory");

module.exports = crudFactory(Achievement, { sortBy: "order -date" });
