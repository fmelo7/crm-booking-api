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

  if (startDate < new Date()) {
    throw { status: 400, message: 'Não é possível agendar no passado' };
  }

  return startDate;
};

const calculateEndAt = (startDate, durationMinutes) =>
  new Date(startDate.getTime() + durationMinutes * 60000);

exports.createAppointment = async (data) => {
  const { customerId, serviceId, professionalId, startAt, notes } = data;

  if (!customerId || !serviceId || !professionalId || !startAt) {
    throw { status: 400, message: 'Campos obrigatórios ausentes' };
  }

  if (!isValidId(customerId) || !isValidId(serviceId) || !isValidId(professionalId)) {
    throw { status: 400, message: 'IDs inválidos' };
  }

  const customer = await Customer.findById(customerId);
  const service = await Service.findById(serviceId);
  const professional = await Professional.findById(professionalId);

  if (!customer || !service || !professional) {
    throw { status: 404, message: 'Entidades não encontradas' };
  }

  const startDate = parseStartAt(startAt);
  const endDate = calculateEndAt(startDate, service.durationMinutes);

  const conflict = await Appointment.findOne({
    professional: professionalId,
    status: 'scheduled',
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
    status: 'scheduled',
    notes
  });
};

exports.getAllAppointments = async (filters = {}) => {
  const query = {};

  if (filters.professionalId) {
    query.professional = filters.professionalId;
  }

  if (filters.customerId) {
    query.customer = filters.customerId;
  }

  if (filters.from && filters.to) {
    query.startAt = {
      $gte: new Date(filters.from),
      $lte: new Date(filters.to)
    };
  }

  return Appointment.find(query)
    .sort({ startAt: 1 })
    .populate('customer service professional');
};

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
    throw { status: 400, message: 'ID inválido' };
  }

  const current = await Appointment.findById(id);
  if (!current) {
    throw { status: 404, message: 'Agendamento não encontrado' };
  }

  const service = await Service.findById(current.service);

  const startDate = parseStartAt(startAt);
  const endDate = calculateEndAt(startDate, service.durationMinutes);

  const conflict = await Appointment.findOne({
    _id: { $ne: id },
    professional: current.professional,
    status: 'scheduled',
    startAt: { $lt: endDate },
    endAt: { $gt: startDate }
  });

  if (conflict) {
    throw { status: 409, message: 'Horário ocupado' };
  }

  current.reschedules.push({
    oldStartAt: current.startAt,
    oldEndAt: current.endAt
  });

  current.startAt = startDate;
  current.endAt = endDate;

  if (notes !== undefined) {
    current.notes = notes;
  }

  await current.save();

  return current.populate('customer service professional');
};

exports.cancelAppointment = async (id) => {
  if (!isValidId(id)) {
    throw { status: 400, message: 'ID inválido' };
  }

  const appointment = await Appointment.findById(id);

  if (!appointment) {
    throw { status: 404, message: 'Agendamento não encontrado' };
  }

  appointment.status = 'cancelled';
  await appointment.save();

  return appointment;
};

exports.completeAppointment = async (id) => {
  const appointment = await Appointment.findById(id);

  if (!appointment) {
    throw { status: 404, message: 'Agendamento não encontrado' };
  }

  appointment.status = 'completed';
  await appointment.save();

  return appointment;
};

exports.getAvailability = async ({ professionalId, date, durationMinutes = 60 }) => {
  if (!isValidId(professionalId)) {
    throw { status: 400, message: 'Professional inválido' };
  }

  if (!date) {
    throw { status: 400, message: 'Data é obrigatória' };
  }

  // const selectedDate = new Date(date);
  const selectedDate = new Date(date + 'T00:00:00');

  if (isNaN(selectedDate)) {
    throw { status: 400, message: 'Data inválida' };
  }

  const startOfDay = new Date(selectedDate);
  startOfDay.setHours(9, 0, 0, 0);

  const endOfDay = new Date(selectedDate);
  endOfDay.setHours(18, 0, 0, 0);

  const appointments = await Appointment.find({
    professional: professionalId,
    status: 'scheduled',
    startAt: { $lt: endOfDay },
    endAt: { $gt: startOfDay }
  });

  const slots = [];
  const slotInterval = 30; // minutos (granularidade UI)

  for (
    let current = new Date(startOfDay);
    current < endOfDay;
    current = new Date(current.getTime() + slotInterval * 60000)
  ) {
    const slotStart = new Date(current);
    const slotEnd = new Date(
      slotStart.getTime() + durationMinutes * 60000
    );

    // não deixar passar do fim do expediente
    if (slotEnd > endOfDay) break;

    const hasConflict = appointments.some(app =>
      app.startAt < slotEnd && app.endAt > slotStart
    );

    if (!hasConflict) {
      slots.push(slotStart);
    }
  }

  return slots;
};

