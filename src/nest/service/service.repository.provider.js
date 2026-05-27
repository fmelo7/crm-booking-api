const serviceRepository = require('../../../packages/domains/service/service.repository');
const { createRepositoryProvider } = require('../common/repositoryProvider');

const ServiceRepositoryProvider = createRepositoryProvider(serviceRepository, [
  'create',
  'paginate',
  'findById',
  'updateById',
  'deleteById',
]);

module.exports = ServiceRepositoryProvider;
