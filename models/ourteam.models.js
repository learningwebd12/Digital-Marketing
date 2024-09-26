const mongoose = require("mongoose");

const teamSchema = new mongoose.Schema({
  name: String,
  position: String,
  profilePic: String,
  linkedin: String,
  instagram: String,
});

const TeamMember = mongoose.model("TeamMember", teamSchema);

module.exports = TeamMember;
