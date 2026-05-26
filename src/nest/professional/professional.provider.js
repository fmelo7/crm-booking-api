const AppointmentRepositoryProvider = require('../appointment/appointment.repository.provider');
const ProfessionalRepositoryProvider = require('./professional.repository.provider');
const { defineInjectable } = require('../common/injection');
const {
  assertFound,
  assertNoLinkedAppointment,
  assertRequiredFields,
} = require('../../modules/common/entityAssertions');
const { buildSearchQuery } = require('../../modules/common/searchQuery');

const messages = {
  linkedAppointment: 'Profissional possui agendamentos vinculados e não pode ser removido',
  notFound: 'Profissional não encontrado',
  required: 'Nome e categoria são obrigatórios',
};

class ProfessionalProvider {
  constructor(professionalRepository, appointmentRepository) {
    this.professionalRepository = professionalRepository;
    this.appointmentRepository = appointmentRepository;
  }

  create(data) {
    assertRequiredFields(data, ['name', 'category'], messages.required);

    return this.professionalRepository.create(data);
  }

  list(filters) {
    const query = buildSearchQuery(filters.search, ['name', 'category', 'email', 'phone']);

    return this.professionalRepository.paginate(query, {
      page: filters.page,
      limit: filters.limit,
      sort: { name: 1 },
    });
  }

  async getById(id) {
    const item = await this.professionalRepository.findById(id);
    return assertFound(item, messages.notFound);
  }

  async update(id, data) {
    const item = await this.professionalRepository.updateById(id, data);
    return assertFound(item, messages.notFound);
  }

  async remove(id) {
    const appointment = await this.appointmentRepository.existsForProfessional(id);
    assertNoLinkedAppointment(appointment, messages.linkedAppointment);

    const item = await this.professionalRepository.deleteById(id);
    return assertFound(item, messages.notFound);
  }
}

defineInjectable(ProfessionalProvider, [ProfessionalRepositoryProvider, AppointmentRepositoryProvider]);

module.exports = ProfessionalProvider;
