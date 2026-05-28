const ProfessionalRepositoryProvider = require('./professional.repository.provider');
const { defineInjectable } = require('../common/injection');
const {
  assertFound,
  assertNoLinkedAppointment,
  assertRequiredFields,
} = require('../../../packages/shared/common/entityAssertions');
const { buildSearchQuery } = require('../../../packages/shared/common/searchQuery');

const messages = {
  linkedAppointment: 'Profissional possui agendamentos vinculados e não pode ser removido',
  notFound: 'Profissional não encontrado',
  required: 'Nome e categoria são obrigatórios',
};

class ProfessionalProvider {
  constructor(professionalRepository, references = {}) {
    this.professionalRepository = professionalRepository;
    this.references = references;
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
    if (this.references.existsForProfessional) {
      const appointment = await this.references.existsForProfessional(id);
      assertNoLinkedAppointment(appointment, messages.linkedAppointment);
    }

    const item = await this.professionalRepository.deleteById(id);
    return assertFound(item, messages.notFound);
  }
}

defineInjectable(ProfessionalProvider, [ProfessionalRepositoryProvider]);

module.exports = ProfessionalProvider;
