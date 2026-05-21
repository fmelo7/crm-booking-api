const mongoose = require('mongoose');
const Appointment = require('./appointment.model');
const Customer = require('../customer/customer.model');
const Service = require('../service/service.model');
const Professional = require('../professional/professional.model');

const DURATION_MINUTES = 60;

const isValidId = (id) => mongoose.Types.ObjectId.isValid(id);

const parseStartAt = (startAt) => {
  const startDate = new Date(startAt);
  if (isNaN(startDate)) {
    throw { status: 400, message: 'startAt inválido' };
  }
  return startDate;
};

const calculateEndAt = (startDate) =>
  new Date(startDate.getTime() + DURATION_MINUTES * 60000);

exports.createAppointment = async (data) => {
  const { customerId, serviceId, professionalId, startAt, notes } = data;

  if (!customerId || !serviceId || !professionalId || !startAt) {
    throw { status: 400, message: 'Campos obrigatórios ausentes' };
  }

  if (!isValidId(customerId) || !isValidId(serviceId) || !isValidId(professionalId)) {
    throw { status: 400, message: 'IDs inválidos para cliente, serviço ou profissional' };
  }

  const customer = await Customer.findById(customerId);
  const service = await Service.findById(serviceId);
  const professional = await Professional.findById(professionalId);

  if (!customer || !service || !professional) {
    throw { status: 404, message: 'Cliente, serviço ou profissional não encontrado' };
  }

  const startDate = parseStartAt(startAt);
  const endDate = calculateEndAt(startDate);

  const conflict = await Appointment.findOne({
    professional: professionalId,
    startAt: { $lt: endDate },
    endAt: { $gt: startDate }
  });

  if (conflict) {
    throw { status: 409, message: 'Horário ocupado' };
  }

  return Appointment.create({
    customer: customerId,
    service: serviceId,
    professional: professionalId,
    startAt: startDate,
    endAt: endDate,
    notes
  });
};

exports.getAllAppointments = async () =>
  Appointment.find()
    .sort({ startAt: 1 })
    .populate('customer service professional');

exports.getAppointmentById = async (id) => {
  if (!isValidId(id)) {
    throw { status: 400, message: 'ID de agendamento inválido' };
  }

  const item = await Appointment.findById(id).populate('customer service professional');
  if (!item) throw { status: 404, message: 'Agendamento não encontrado' };
  return item;
};

exports.rescheduleAppointment = async (id, data) => {
  const { startAt, notes } = data;

  if (!isValidId(id)) {
    throw { status: 400, message: 'ID de agendamento inválido' };
  }

  if (!startAt) {
    throw { status: 400, message: 'startAt é obrigatório para reagendar' };
  }

  const current = await Appointment.findById(id);
  if (!current) {
    throw { status: 404, message: 'Agendamento não encontrado' };
  }

  const startDate = parseStartAt(startAt);
  const endDate = calculateEndAt(startDate);

  const conflict = await Appointment.findOne({
    _id: { $ne: id },
    professional: current.professional,
    startAt: { $lt: endDate },
    endAt: { $gt: startDate }
  });

  if (conflict) {
    throw { status: 409, message: 'Horário ocupado' };
  }

  const update = {
    startAt: startDate,
    endAt: endDate,
  };

  if (notes !== undefined) {
    update.notes = notes;
  }

  return Appointment
    .findByIdAndUpdate(id, update, { new: true, runValidators: true })
    .populate('customer service professional');
};

exports.cancelAppointment = async (id) => {
  if (!isValidId(id)) {
    throw { status: 400, message: 'ID de agendamento inválido' };
  }

  const item = await Appointment.findByIdAndDelete(id);
  if (!item) {
    throw { status: 404, message: 'Agendamento não encontrado' };
  }

  return item;
};
