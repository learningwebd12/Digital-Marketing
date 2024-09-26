const mongoose = require("mongoose");

// Connect to MongoDB
mongoose.connect("mongodb://127.0.0.1:27017/marketing");

const aboutSchema = new mongoose.Schema({
  title: String,
  description: String,
});

const About = mongoose.model("About", aboutSchema);

module.exports = About;
