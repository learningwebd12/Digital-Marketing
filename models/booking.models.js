const mongoose = require("mongoose");

const bookingSchema = new mongoose.Schema({
  fullName: { type: String, required: true },
  phoneNumber: { type: String, required: true },
  service: { type: String, required: true },
  email: { type: String, required: true },
  pricing: { type: Number, required: true },
  createdAt: { type: Date, default: Date.now },
});

const Booking = mongoose.model("Booking", bookingSchema);
module.exports = Booking;
