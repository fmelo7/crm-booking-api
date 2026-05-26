const customerRepository = require('./customer.repository');
const appointmentRepository = require('../appointment/appointment.repository');
const {
  assertFound,
  assertNoLinkedAppointment,
  assertRequiredFields,
} = require('../common/entityAssertions');
const { buildSearchQuery } = require('../common/searchQuery');

const messages = {
  linkedAppointment: 'Cliente possui agendamentos vinculados e não pode ser removido',
  notFound: 'Cliente não encontrado',
  required: 'Nome do cliente é obrigatório',
};

exports.createCustomer = async (data) => {
  assertRequiredFields(data, ['name'], messages.required);

  return customerRepository.create(data);
};

exports.getCustomers = async (filters = {}) => {
  const query = buildSearchQuery(filters.search, ['name', 'email', 'phone']);

  return customerRepository.paginate(query, {
    page: filters.page,
    limit: filters.limit,
    sort: { name: 1 },
  });
};

exports.getCustomerById = async (id) => {
  const item = await customerRepository.findById(id);
  return assertFound(item, messages.notFound);
};

exports.updateCustomer = async (id, data) => {
  const item = await customerRepository.updateById(id, data);
  return assertFound(item, messages.notFound);
};

exports.deleteCustomer = async (id) => {
  const appointment = await appointmentRepository.existsForCustomer(id);
  assertNoLinkedAppointment(appointment, messages.linkedAppointment);

  const item = await customerRepository.deleteById(id);
  return assertFound(item, messages.notFound);
};
