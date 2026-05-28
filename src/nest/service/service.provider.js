const AppointmentRepositoryProvider = require('../appointment/appointment.repository.provider');
const ServiceRepositoryProvider = require('./service.repository.provider');
const { defineInjectable } = require('../common/injection');
const {
  assertFound,
  assertNoLinkedAppointment,
  assertRequiredFields,
} = require('../../../packages/shared/common/entityAssertions');
const { buildSearchQuery } = require('../../../packages/shared/common/searchQuery');

const messages = {
  linkedAppointment: 'Serviço possui agendamentos vinculados e não pode ser removido',
  notFound: 'Serviço não encontrado',
  required: 'Nome do serviço é obrigatório',
};

const shouldCheckAppointmentLinks = () => process.env.SERVICE_NAME !== 'services-service';

class ServiceProvider {
  constructor(serviceRepository, appointmentRepository) {
    this.serviceRepository = serviceRepository;
    this.appointmentRepository = appointmentRepository;
  }

  create(data) {
    assertRequiredFields(data, ['name'], messages.required);

    return this.serviceRepository.create(data);
  }

  list(filters) {
    const query = buildSearchQuery(filters.search, ['name', 'description']);

    return this.serviceRepository.paginate(query, {
      page: filters.page,
      limit: filters.limit,
      sort: { name: 1 },
    });
  }

  async getById(id) {
    const item = await this.serviceRepository.findById(id);
    return assertFound(item, messages.notFound);
  }

  async update(id, data) {
    const item = await this.serviceRepository.updateById(id, data);
    return assertFound(item, messages.notFound);
  }

  async remove(id) {
    if (shouldCheckAppointmentLinks()) {
      const appointment = await this.appointmentRepository.existsForService(id);
      assertNoLinkedAppointment(appointment, messages.linkedAppointment);
    }

    const item = await this.serviceRepository.deleteById(id);
    return assertFound(item, messages.notFound);
  }
}

defineInjectable(ServiceProvider, [ServiceRepositoryProvider, AppointmentRepositoryProvider]);

module.exports = ServiceProvider;
