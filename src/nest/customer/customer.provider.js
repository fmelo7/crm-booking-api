const CustomerRepositoryProvider = require('./customer.repository.provider');
const AppointmentRepositoryProvider = require('../appointment/appointment.repository.provider');
const { defineInjectable } = require('../common/injection');
const {
  assertFound,
  assertNoLinkedAppointment,
  assertRequiredFields,
} = require('../../../packages/shared/common/entityAssertions');
const { buildSearchQuery } = require('../../../packages/shared/common/searchQuery');

const messages = {
  linkedAppointment: 'Cliente possui agendamentos vinculados e não pode ser removido',
  notFound: 'Cliente não encontrado',
  required: 'Nome do cliente é obrigatório',
};

class CustomerProvider {
  constructor(customerRepository, appointmentRepository) {
    this.customerRepository = customerRepository;
    this.appointmentRepository = appointmentRepository;
  }

  create(data) {
    assertRequiredFields(data, ['name'], messages.required);

    return this.customerRepository.create(data);
  }

  list(filters) {
    const query = buildSearchQuery(filters.search, ['name', 'email', 'phone']);

    return this.customerRepository.paginate(query, {
      page: filters.page,
      limit: filters.limit,
      sort: { name: 1 },
    });
  }

  async getById(id) {
    const item = await this.customerRepository.findById(id);
    return assertFound(item, messages.notFound);
  }

  async update(id, data) {
    const item = await this.customerRepository.updateById(id, data);
    return assertFound(item, messages.notFound);
  }

  async remove(id) {
    const appointment = await this.appointmentRepository.existsForCustomer(id);
    assertNoLinkedAppointment(appointment, messages.linkedAppointment);

    const item = await this.customerRepository.deleteById(id);
    return assertFound(item, messages.notFound);
  }
}

defineInjectable(CustomerProvider, [CustomerRepositoryProvider, AppointmentRepositoryProvider]);

module.exports = CustomerProvider;
