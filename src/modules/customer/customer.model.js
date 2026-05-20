const mongoose = require('mongoose');

const schema = new mongoose.Schema({
  name: { type: String, required: true },
  phone: String,
  email: String,
  notes: String
}, { timestamps: true });

module.exports = mongoose.model('Customer', schema);
