const serviceRepository = require('./service.repository');
const appointmentRepository = require('../appointment/appointment.repository');
const {
  assertFound,
  assertNoLinkedAppointment,
  assertRequiredFields,
} = require('../common/entityAssertions');
const { buildSearchQuery } = require('../common/searchQuery');

const messages = {
  linkedAppointment: 'Serviço possui agendamentos vinculados e não pode ser removido',
  notFound: 'Serviço não encontrado',
  required: 'Nome do serviço é obrigatório',
};

exports.createService = async (data) => {
  assertRequiredFields(data, ['name'], messages.required);

  return serviceRepository.create(data);
};

exports.getServices = async (filters = {}) => {
  const query = buildSearchQuery(filters.search, ['name', 'description']);

  return serviceRepository.paginate(query, {
    page: filters.page,
    limit: filters.limit,
    sort: { name: 1 },
  });
};

exports.getServiceById = async (id) => {
  const item = await serviceRepository.findById(id);
  return assertFound(item, messages.notFound);
};

exports.updateService = async (id, data) => {
  const item = await serviceRepository.updateById(id, data);
  return assertFound(item, messages.notFound);
};

exports.deleteService = async (id) => {
  const appointment = await appointmentRepository.existsForService(id);
  assertNoLinkedAppointment(appointment, messages.linkedAppointment);

  const item = await serviceRepository.deleteById(id);
  return assertFound(item, messages.notFound);
};
