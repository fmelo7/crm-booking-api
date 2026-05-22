// appointment.controller.js

const service = require('./appointment.service');

exports.create = async (req, res) => {
  const result = await service.createAppointment(req.body);
  res.status(201).json(result);
};

exports.list = async (req, res) => {
  const result = await service.getAllAppointments(req.query);
  res.json(result);
};

exports.getById = async (req, res) => {
  const result = await service.getAppointmentById(req.params.id);
  res.json(result);
};

exports.reschedule = async (req, res) => {
  const result = await service.rescheduleAppointment(req.params.id, req.body);
  res.json(result);
};

exports.cancel = async (req, res) => {
  const result = await service.cancelAppointment(req.params.id);
  res.json(result);
};

exports.complete = async (req, res) => {
  const result = await service.completeAppointment(req.params.id);
  res.json(result);
};

exports.getAvailability = async (req, res) => {
  const { professionalId, date, serviceId, durationMinutes } = req.query;

  const result = await service.getAvailability({
    professionalId,
    date,
    serviceId,
    durationMinutes: durationMinutes ? Number(durationMinutes) : 60
  });

  res.json(result);
};
