const serviceRepository = require('../../domain/service/service.repository');
const { createRepositoryProvider } = require('../common/repositoryProvider');

const ServiceRepositoryProvider = createRepositoryProvider(serviceRepository, [
  'create',
  'paginate',
  'findById',
  'updateById',
  'deleteById',
]);

module.exports = ServiceRepositoryProvider;
