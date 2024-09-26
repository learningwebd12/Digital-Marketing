const mongoose = require("mongoose");

const servicesSchema = new mongoose.Schema({
  name: String,
  description: String,
});

const Services = mongoose.model("Services", servicesSchema);

module.exports = Services;
