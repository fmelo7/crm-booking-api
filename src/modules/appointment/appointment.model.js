const mongoose = require('mongoose');

const schema = new mongoose.Schema({
  customer: { type: mongoose.Schema.Types.ObjectId, ref: 'Customer', required: true },
  service: { type: mongoose.Schema.Types.ObjectId, ref: 'Service', required: true },
  professional: { type: mongoose.Schema.Types.ObjectId, ref: 'Professional', required: true },

  startAt: { type: Date, required: true },
  endAt: { type: Date, required: true },

  status: {
    type: String,
    enum: ['scheduled', 'cancelled', 'completed'],
    default: 'scheduled'
  },

  reschedules: [
    {
      oldStartAt: Date,
      oldEndAt: Date,
      changedAt: { type: Date, default: Date.now }
    }
  ],

  notes: String
}, { timestamps: true });

schema.index({ professional: 1, startAt: 1, endAt: 1 });

module.exports = mongoose.model('Appointment', schema);
