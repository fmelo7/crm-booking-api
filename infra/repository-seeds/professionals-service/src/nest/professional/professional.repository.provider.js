const professionalRepository = require('../../domain/professional/professional.repository');
const { createRepositoryProvider } = require('../common/repositoryProvider');

const ProfessionalRepositoryProvider = createRepositoryProvider(professionalRepository, [
  'create',
  'paginate',
  'findById',
  'updateById',
  'deleteById',
]);

module.exports = ProfessionalRepositoryProvider;
