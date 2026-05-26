const appointmentRepository = require('./appointment.repository');
const customerRepository = require('../customer/customer.repository');
const serviceRepository = require('../service/service.repository');
const professionalRepository = require('../professional/professional.repository');
const { isValidObjectId } = require('../common/objectId');
const {
  buildAvailabilityWindow,
  buildAvailableSlots,
  buildAppointmentListQuery,
  calculateEndAt,
  ensureScheduled,
  parseStartAt,
} = require('./appointment.rules');

exports.createAppointment = async (data) => {
  const { customerId, serviceId, professionalId, startAt, notes } = data;

  if (!customerId || !serviceId || !professionalId || !startAt) {
    throw { status: 400, message: 'Campos obrigatórios ausentes' };
  }

  if (!isValidObjectId(customerId) || !isValidObjectId(serviceId) || !isValidObjectId(professionalId)) {
    throw { status: 400, message: 'IDs inválidos' };
  }

  const customer = await customerRepository.findById(customerId);
  const service = await serviceRepository.findById(serviceId);
  const professional = await professionalRepository.findById(professionalId);

  if (!customer || !service || !professional) {
    throw { status: 404, message: 'Cliente, serviço ou profissional não encontrado' };
  }

  const startDate = parseStartAt(startAt);
  const endDate = calculateEndAt(startDate, service.durationMinutes);

  const conflict = await appointmentRepository.findConflict({
    professionalId,
    startDate,
    endDate,
  });

  if (conflict) {
    throw { status: 409, message: 'Horário ocupado' };
  }

  return appointmentRepository.create({
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
  const query = buildAppointmentListQuery(filters);

  return appointmentRepository.paginate(query, {
    page: filters.page,
    limit: filters.limit,
    sort: { startAt: 1 },
    populate: 'customer service professional',
  });
};

exports.getAppointmentById = async (id) => {
  if (!isValidObjectId(id)) {
    throw { status: 400, message: 'ID de agendamento inválido' };
  }

  const item = await appointmentRepository.findByIdPopulated(id);
  if (!item) throw { status: 404, message: 'Agendamento não encontrado' };
  return item;
};

exports.rescheduleAppointment = async (id, data) => {
  const { startAt, notes } = data;

  if (!isValidObjectId(id)) {
    throw { status: 400, message: 'ID de agendamento inválido' };
  }

  if (!startAt) {
    throw { status: 400, message: 'startAt é obrigatório para reagendar' };
  }

  const current = await appointmentRepository.findById(id);
  if (!current) {
    throw { status: 404, message: 'Agendamento não encontrado' };
  }

  ensureScheduled(current, 'reagendado');

  const service = await serviceRepository.findById(current.service);
  if (!service) {
    throw { status: 404, message: 'Serviço do agendamento não encontrado' };
  }

  const startDate = parseStartAt(startAt);
  const endDate = calculateEndAt(startDate, service.durationMinutes);

  const conflict = await appointmentRepository.findConflict({
    professionalId: current.professional,
    startDate,
    endDate,
    excludeId: id,
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
  if (!isValidObjectId(id)) {
    throw { status: 400, message: 'ID de agendamento inválido' };
  }

  const appointment = await appointmentRepository.findById(id);

  if (!appointment) {
    throw { status: 404, message: 'Agendamento não encontrado' };
  }

  ensureScheduled(appointment, 'cancelado');

  appointment.status = 'cancelled';
  await appointment.save();

  return appointment.populate('customer service professional');
};

exports.completeAppointment = async (id) => {
  if (!isValidObjectId(id)) {
    throw { status: 400, message: 'ID de agendamento inválido' };
  }

  const appointment = await appointmentRepository.findById(id);

  if (!appointment) {
    throw { status: 404, message: 'Agendamento não encontrado' };
  }

  ensureScheduled(appointment, 'concluído');

  appointment.status = 'completed';
  await appointment.save();

  return appointment.populate('customer service professional');
};

exports.getAvailability = async ({ professionalId, date, serviceId, durationMinutes = 60 }) => {
  if (!isValidObjectId(professionalId)) {
    throw { status: 400, message: 'Professional inválido' };
  }

  if (serviceId) {
    if (!isValidObjectId(serviceId)) {
      throw { status: 400, message: 'Serviço inválido' };
    }

    const service = await serviceRepository.findById(serviceId);
    if (!service) {
      throw { status: 404, message: 'Serviço não encontrado' };
    }

    durationMinutes = service.durationMinutes;
  }

  const { startOfDay, endOfDay } = buildAvailabilityWindow(date);

  const appointments = await appointmentRepository.findScheduledOverlapping({
    professionalId,
    startDate: startOfDay,
    endDate: endOfDay,
  });

  return buildAvailableSlots({
    appointments,
    durationMinutes,
    endOfDay,
    startOfDay,
  });
};
