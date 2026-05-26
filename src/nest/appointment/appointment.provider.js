const { Injectable } = require('@nestjs/common');
const mongoose = require('mongoose');
const AppointmentRepositoryProvider = require('./appointment.repository.provider');
const CustomerRepositoryProvider = require('../customer/customer.repository.provider');
const ProfessionalRepositoryProvider = require('../professional/professional.repository.provider');
const ServiceRepositoryProvider = require('../service/service.repository.provider');

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

const ensureScheduled = (appointment, action) => {
  if (appointment.status !== 'scheduled') {
    throw { status: 409, message: `Agendamento ${appointment.status} não pode ser ${action}` };
  }
};

class AppointmentProvider {
  constructor(
    appointmentRepository,
    customerRepository,
    serviceRepository,
    professionalRepository
  ) {
    this.appointmentRepository = appointmentRepository;
    this.customerRepository = customerRepository;
    this.serviceRepository = serviceRepository;
    this.professionalRepository = professionalRepository;
  }

  async create(data) {
    const { customerId, serviceId, professionalId, startAt, notes } = data;

    if (!customerId || !serviceId || !professionalId || !startAt) {
      throw { status: 400, message: 'Campos obrigatórios ausentes' };
    }

    if (!isValidId(customerId) || !isValidId(serviceId) || !isValidId(professionalId)) {
      throw { status: 400, message: 'IDs inválidos' };
    }

    const customer = await this.customerRepository.findById(customerId);
    const service = await this.serviceRepository.findById(serviceId);
    const professional = await this.professionalRepository.findById(professionalId);

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
    const query = {};

    if (filters.professionalId) {
      query.professional = filters.professionalId;
    }

    if (filters.customerId) {
      query.customer = filters.customerId;
    }

    if (filters.status) {
      query.status = filters.status;
    }

    if (filters.date) {
      const selectedDate = new Date(`${filters.date}T00:00:00`);
      if (isNaN(selectedDate)) {
        throw { status: 400, message: 'Data inválida' };
      }

      const nextDay = new Date(selectedDate);
      nextDay.setDate(nextDay.getDate() + 1);

      query.startAt = {
        $gte: selectedDate,
        $lt: nextDay,
      };
    } else if (filters.from || filters.to) {
      query.startAt = {};

      if (filters.from) {
        const from = new Date(filters.from);
        if (isNaN(from)) throw { status: 400, message: 'Data inicial inválida' };
        query.startAt.$gte = from;
      }

      if (filters.to) {
        const to = new Date(filters.to);
        if (isNaN(to)) throw { status: 400, message: 'Data final inválida' };
        query.startAt.$lte = to;
      }
    }

    return this.appointmentRepository.paginate(query, {
      page: filters.page,
      limit: filters.limit,
      sort: { startAt: 1 },
      populate: 'customer service professional',
    });
  }

  async getById(id) {
    if (!isValidId(id)) {
      throw { status: 400, message: 'ID de agendamento inválido' };
    }

    const item = await this.appointmentRepository.findByIdPopulated(id);
    if (!item) throw { status: 404, message: 'Agendamento não encontrado' };
    return item;
  }

  async reschedule(id, data) {
    const { startAt, notes } = data;

    if (!isValidId(id)) {
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

    const service = await this.serviceRepository.findById(current.service);
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
    if (!isValidId(id)) {
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
    if (!isValidId(id)) {
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
    if (!isValidId(professionalId)) {
      throw { status: 400, message: 'Professional inválido' };
    }

    if (serviceId) {
      if (!isValidId(serviceId)) {
        throw { status: 400, message: 'Serviço inválido' };
      }

      const service = await this.serviceRepository.findById(serviceId);
      if (!service) {
        throw { status: 404, message: 'Serviço não encontrado' };
      }

      durationMinutes = service.durationMinutes;
    }

    if (!date) {
      throw { status: 400, message: 'Data é obrigatória' };
    }

    const selectedDate = new Date(`${date}T00:00:00`);

    if (isNaN(selectedDate)) {
      throw { status: 400, message: 'Data inválida' };
    }

    const startOfDay = new Date(selectedDate);
    startOfDay.setHours(9, 0, 0, 0);

    const endOfDay = new Date(selectedDate);
    endOfDay.setHours(18, 0, 0, 0);

    const appointments = await this.appointmentRepository.findScheduledOverlapping({
      professionalId,
      startDate: startOfDay,
      endDate: endOfDay,
    });

    const slots = [];
    const slotInterval = 30;

    for (
      let current = new Date(startOfDay);
      current < endOfDay;
      current = new Date(current.getTime() + slotInterval * 60000)
    ) {
      const slotStart = new Date(current);
      const slotEnd = new Date(
        slotStart.getTime() + durationMinutes * 60000
      );

      if (slotEnd > endOfDay) break;

      const hasConflict = appointments.some(app =>
        app.startAt < slotEnd && app.endAt > slotStart
      );

      if (!hasConflict) {
        slots.push(slotStart);
      }
    }

    return slots;
  }
}

Reflect.defineMetadata(
  'design:paramtypes',
  [
    AppointmentRepositoryProvider,
    CustomerRepositoryProvider,
    ServiceRepositoryProvider,
    ProfessionalRepositoryProvider,
  ],
  AppointmentProvider
);
Injectable()(AppointmentProvider);

module.exports = AppointmentProvider;
