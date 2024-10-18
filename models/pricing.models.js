const pricingSchema = new mongoose.Schema({
  planName: {
    type: String,
    required: true,
  },
  decription: {
    type: String,
    required: true,
  },
  features: {
    type: [String],
    required: true,
  },
  price: {
    type: Number,
    required: true,
  },
  duration: {
    type: String, //E.g "months", "year"
    default: "monthly",
  },
  createdAt: {
    type: Date,
    default: Date.now,
  },
});

module.exports = mongoose.model("Pricing", pricingSchema);
