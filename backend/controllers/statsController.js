const Stat = require("../models/Stat");
const crudFactory = require("./crudFactory");

module.exports = crudFactory(Stat, { sortBy: "order" });
