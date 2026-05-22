// appointment.controller.js

const service = require('./appointment.service');
const { sendError } = require('../../middlewares/error');

exports.create = async (req, res) => {
  try {
    const result = await service.createAppointment(req.body);
    res.status(201).json(result);
  } catch (err) {
    sendError(res, err);
  }
};

exports.list = async (req, res) => {
  try {
    const result = await service.getAllAppointments(req.query);
    res.json(result);
  } catch (err) {
    sendError(res, err);
  }
};

exports.getById = async (req, res) => {
  try {
    const result = await service.getAppointmentById(req.params.id);
    res.json(result);
  } catch (err) {
    sendError(res, err);
  }
};

exports.reschedule = async (req, res) => {
  try {
    const result = await service.rescheduleAppointment(req.params.id, req.body);
    res.json(result);
  } catch (err) {
    sendError(res, err);
  }
};

exports.cancel = async (req, res) => {
  try {
    const result = await service.cancelAppointment(req.params.id);
    res.json(result);
  } catch (err) {
    sendError(res, err);
  }
};

exports.complete = async (req, res) => {
  try {
    const result = await service.completeAppointment(req.params.id);
    res.json(result);
  } catch (err) {
    sendError(res, err);
  }
};

exports.getAvailability = async (req, res, next) => {
  try {
    const { professionalId, date, serviceId, durationMinutes } = req.query;

    const result = await service.getAvailability({
      professionalId,
      date,
      serviceId,
      durationMinutes: durationMinutes ? Number(durationMinutes) : 60
    });

    res.json(result);
  } catch (err) {
    next(err);
  }
};
