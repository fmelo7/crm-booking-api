const { Injectable } = require('@nestjs/common');
const AppointmentRepositoryProvider = require('../appointment/appointment.repository.provider');
const ProfessionalRepositoryProvider = require('./professional.repository.provider');

const escapeRegExp = (value) => value.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');

class ProfessionalProvider {
  constructor(professionalRepository, appointmentRepository) {
    this.professionalRepository = professionalRepository;
    this.appointmentRepository = appointmentRepository;
  }

  create(data) {
    const { name, category } = data;

    if (!name || !category) {
      throw { status: 400, message: 'Nome e categoria são obrigatórios' };
    }

    return this.professionalRepository.create(data);
  }

  list(filters) {
    const query = {};

    if (filters.search) {
      const search = new RegExp(escapeRegExp(filters.search), 'i');
      query.$or = [
        { name: search },
        { category: search },
        { email: search },
        { phone: search },
      ];
    }

    return this.professionalRepository.paginate(query, {
      page: filters.page,
      limit: filters.limit,
      sort: { name: 1 },
    });
  }

  async getById(id) {
    const item = await this.professionalRepository.findById(id);
    if (!item) throw { status: 404, message: 'Profissional não encontrado' };
    return item;
  }

  async update(id, data) {
    const item = await this.professionalRepository.updateById(id, data);
    if (!item) throw { status: 404, message: 'Profissional não encontrado' };
    return item;
  }

  async remove(id) {
    const appointment = await this.appointmentRepository.existsForProfessional(id);
    if (appointment) {
      throw { status: 409, message: 'Profissional possui agendamentos vinculados e não pode ser removido' };
    }

    const item = await this.professionalRepository.deleteById(id);
    if (!item) throw { status: 404, message: 'Profissional não encontrado' };
    return item;
  }
}

Reflect.defineMetadata(
  'design:paramtypes',
  [ProfessionalRepositoryProvider, AppointmentRepositoryProvider],
  ProfessionalProvider
);
Injectable()(ProfessionalProvider);

module.exports = ProfessionalProvider;
