const AppointmentRepositoryProvider = require('./appointment.repository.provider');
const { defineInjectable } = require('../common/injection');
const { isValidObjectId } = require('../../shared/common/objectId');
const {
  buildAvailabilityWindow,
  buildAvailableSlots,
  buildAppointmentListQuery,
  calculateEndAt,
  ensureScheduled,
  parseStartAt,
} = require('../../domain/appointment/rules');

class AppointmentProvider {
  constructor(appointmentRepository, references = {}) {
    this.appointmentRepository = appointmentRepository;
    this.references = references;
  }

  findCustomer(id) {
    return this.references.findCustomer?.(id) || { _id: id };
  }

  findService(id) {
    return this.references.findService?.(id) || { _id: id, durationMinutes: 60 };
  }

  findProfessional(id) {
    return this.references.findProfessional?.(id) || { _id: id };
  }

  async create(data) {
    const { customerId, serviceId, professionalId, startAt, notes } = data;

    if (!customerId || !serviceId || !professionalId || !startAt) {
      throw { status: 400, message: 'Campos obrigatórios ausentes' };
    }

    if (!isValidObjectId(customerId) || !isValidObjectId(serviceId) || !isValidObjectId(professionalId)) {
      throw { status: 400, message: 'IDs inválidos' };
    }

    const customer = await this.findCustomer(customerId);
    const service = await this.findService(serviceId);
    const professional = await this.findProfessional(professionalId);

    if (!customer || !service || !professional) {
      throw { status: 404, message: 'Cliente, serviço ou profissional não encontrado' };
    }

    const startDate = parseStartAt(startAt);
    const endDate = calculateEndAt(startDate, service.durationMinutes);

    const conflict = await this.appointmentRepository.findConflict({
      professionalId,
      startDate,
      endDate,
    });

    if (conflict) {
      throw { status: 409, message: 'Horário ocupado' };
    }

    return this.appointmentRepository.create({
      customer: customerId,
      service: serviceId,
      professional: professionalId,
      startAt: startDate,
      endAt: endDate,
      status: 'scheduled',
      notes,
    });
  }

  list(filters) {
    const query = buildAppointmentListQuery(filters);

    return this.appointmentRepository.paginate(query, {
      page: filters.page,
      limit: filters.limit,
      sort: { startAt: 1 },
      populate: 'customer service professional',
    });
  }

  async getById(id) {
    if (!isValidObjectId(id)) {
      throw { status: 400, message: 'ID de agendamento inválido' };
    }

    const item = await this.appointmentRepository.findByIdPopulated(id);
    if (!item) throw { status: 404, message: 'Agendamento não encontrado' };
    return item;
  }

  async reschedule(id, data) {
    const { startAt, notes } = data;

    if (!isValidObjectId(id)) {
      throw { status: 400, message: 'ID de agendamento inválido' };
    }

    if (!startAt) {
      throw { status: 400, message: 'startAt é obrigatório para reagendar' };
    }

    const current = await this.appointmentRepository.findById(id);
    if (!current) {
      throw { status: 404, message: 'Agendamento não encontrado' };
    }

    ensureScheduled(current, 'reagendado');

    const service = await this.findService(current.service);
    if (!service) {
      throw { status: 404, message: 'Serviço do agendamento não encontrado' };
    }

    const startDate = parseStartAt(startAt);
    const endDate = calculateEndAt(startDate, service.durationMinutes);

    const conflict = await this.appointmentRepository.findConflict({
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
      oldEndAt: current.endAt,
    });

    current.startAt = startDate;
    current.endAt = endDate;

    if (notes !== undefined) {
      current.notes = notes;
    }

    await current.save();

    return current.populate('customer service professional');
  }

  async cancel(id) {
    if (!isValidObjectId(id)) {
      throw { status: 400, message: 'ID de agendamento inválido' };
    }

    const appointment = await this.appointmentRepository.findById(id);

    if (!appointment) {
      throw { status: 404, message: 'Agendamento não encontrado' };
    }

    ensureScheduled(appointment, 'cancelado');

    appointment.status = 'cancelled';
    await appointment.save();

    return appointment.populate('customer service professional');
  }

  async complete(id) {
    if (!isValidObjectId(id)) {
      throw { status: 400, message: 'ID de agendamento inválido' };
    }

    const appointment = await this.appointmentRepository.findById(id);

    if (!appointment) {
      throw { status: 404, message: 'Agendamento não encontrado' };
    }

    ensureScheduled(appointment, 'concluído');

    appointment.status = 'completed';
    await appointment.save();

    return appointment.populate('customer service professional');
  }

  async getAvailability({ professionalId, date, serviceId, durationMinutes = 60 }) {
    if (!isValidObjectId(professionalId)) {
      throw { status: 400, message: 'Professional inválido' };
    }

    if (serviceId) {
      if (!isValidObjectId(serviceId)) {
        throw { status: 400, message: 'Serviço inválido' };
      }

      const service = await this.findService(serviceId);
      if (!service) {
        throw { status: 404, message: 'Serviço não encontrado' };
      }

      durationMinutes = service.durationMinutes;
    }

    const { startOfDay, endOfDay } = buildAvailabilityWindow(date);

    const appointments = await this.appointmentRepository.findScheduledOverlapping({
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
  }
}

defineInjectable(AppointmentProvider, [AppointmentRepositoryProvider]);

module.exports = AppointmentProvider;
