const { Injectable } = require('@nestjs/common');
const AppointmentRepositoryProvider = require('../appointment/appointment.repository.provider');
const ServiceRepositoryProvider = require('./service.repository.provider');

const escapeRegExp = (value) => value.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');

class ServiceProvider {
  constructor(serviceRepository, appointmentRepository) {
    this.serviceRepository = serviceRepository;
    this.appointmentRepository = appointmentRepository;
  }

  create(data) {
    const { name } = data;

    if (!name) {
      throw { status: 400, message: 'Nome do serviço é obrigatório' };
    }

    return this.serviceRepository.create(data);
  }

  list(filters) {
    const query = {};

    if (filters.search) {
      const search = new RegExp(escapeRegExp(filters.search), 'i');
      query.$or = [
        { name: search },
        { description: search },
      ];
    }

    return this.serviceRepository.paginate(query, {
      page: filters.page,
      limit: filters.limit,
      sort: { name: 1 },
    });
  }

  async getById(id) {
    const item = await this.serviceRepository.findById(id);
    if (!item) throw { status: 404, message: 'Serviço não encontrado' };
    return item;
  }

  async update(id, data) {
    const item = await this.serviceRepository.updateById(id, data);
    if (!item) throw { status: 404, message: 'Serviço não encontrado' };
    return item;
  }

  async remove(id) {
    const appointment = await this.appointmentRepository.existsForService(id);
    if (appointment) {
      throw { status: 409, message: 'Serviço possui agendamentos vinculados e não pode ser removido' };
    }

    const item = await this.serviceRepository.deleteById(id);
    if (!item) throw { status: 404, message: 'Serviço não encontrado' };
    return item;
  }
}

Reflect.defineMetadata(
  'design:paramtypes',
  [ServiceRepositoryProvider, AppointmentRepositoryProvider],
  ServiceProvider
);
Injectable()(ServiceProvider);

module.exports = ServiceProvider;
