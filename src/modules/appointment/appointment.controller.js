// appointment.controller.js

const service = require('./appointment.service');

exports.create = async (req, res) => {
  try {
    const result = await service.createAppointment(req.body);
    res.status(201).json(result);
  } catch (err) {
    res.status(err.status || 500).json({ message: err.message });
  }
};

exports.list = async (req, res) => {
  try {
    const result = await service.getAllAppointments();
    res.json(result);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

exports.getById = async (req, res) => {
  try {
    const result = await service.getAppointmentById(req.params.id);
    res.json(result);
  } catch (err) {
    res.status(err.status || 500).json({ message: err.message });
  }
};
