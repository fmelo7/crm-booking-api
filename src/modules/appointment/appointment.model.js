// appointment.model.js

const mongoose = require('mongoose');

const schema = new mongoose.Schema({
  customer: { type: mongoose.Schema.Types.ObjectId, ref: 'Customer', required: true },
  service: { type: mongoose.Schema.Types.ObjectId, ref: 'Service', required: true },
  professional: { type: mongoose.Schema.Types.ObjectId, ref: 'Professional', required: true },
  startAt: { type: Date, required: true },
  endAt: { type: Date, required: true },
  notes: String
}, { timestamps: true });

module.exports = mongoose.model('Appointment', schema);
