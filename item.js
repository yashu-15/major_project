const mongoose = require("mongoose");

const ItemSchema = new mongoose.Schema({
  name: { type: String, required: true },
  weight: { type: Number, required: true },
  expiryDate: { type: Date, required: true },
  imageUrl: { type: String },
});

module.exports = mongoose.model("Item", ItemSchema);
