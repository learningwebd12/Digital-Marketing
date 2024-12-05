const mongoose = require("mongoose");

// Connect to MongoDB
mongoose.connect("mongodb://127.0.0.1:27017/marketing");

const AboutSchema = new mongoose.Schema({
  title: String,
  descriptionOne: String,
  descriptionTwo: String,
});

module.exports = mongoose.model("About", AboutSchema);
