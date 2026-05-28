const mongoose = require('mongoose');

const schema = new mongoose.Schema({
  name: { type: String, required: true },
  category: { type: String, required: true },
  phone: String,
  email: String,
  active: { type: Boolean, default: true }
}, { timestamps: true });

module.exports = mongoose.model('Professional', schema);
