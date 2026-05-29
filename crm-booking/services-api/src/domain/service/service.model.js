const mongoose = require('mongoose');

const schema = new mongoose.Schema({
  name: { type: String, required: true },
  description: String,
  durationMinutes: { type: Number, default: 60 },
  price: { type: Number, default: 0 }
}, { timestamps: true });

module.exports = mongoose.model('Service', schema);
