const professionalRepository = require('./professional.repository');
const appointmentRepository = require('../appointment/appointment.repository');
const {
  assertFound,
  assertNoLinkedAppointment,
  assertRequiredFields,
} = require('../common/entityAssertions');
const { buildSearchQuery } = require('../common/searchQuery');

const messages = {
  linkedAppointment: 'Profissional possui agendamentos vinculados e não pode ser removido',
  notFound: 'Profissional não encontrado',
  required: 'Nome e categoria são obrigatórios',
};

exports.createProfessional = async (data) => {
  assertRequiredFields(data, ['name', 'category'], messages.required);

  return professionalRepository.create(data);
};

exports.getProfessionals = async (filters = {}) => {
  const query = buildSearchQuery(filters.search, ['name', 'category', 'email', 'phone']);

  return professionalRepository.paginate(query, {
    page: filters.page,
    limit: filters.limit,
    sort: { name: 1 },
  });
};

exports.getProfessionalById = async (id) => {
  const item = await professionalRepository.findById(id);
  return assertFound(item, messages.notFound);
};

exports.updateProfessional = async (id, data) => {
  const item = await professionalRepository.updateById(id, data);
  return assertFound(item, messages.notFound);
};

exports.deleteProfessional = async (id) => {
  const appointment = await appointmentRepository.existsForProfessional(id);
  assertNoLinkedAppointment(appointment, messages.linkedAppointment);

  const item = await professionalRepository.deleteById(id);
  return assertFound(item, messages.notFound);
};
