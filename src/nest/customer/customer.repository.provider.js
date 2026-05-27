const customerRepository = require('../../../packages/domains/customer/customer.repository');
const { createRepositoryProvider } = require('../common/repositoryProvider');

const CustomerRepositoryProvider = createRepositoryProvider(customerRepository, [
  'create',
  'paginate',
  'findById',
  'updateById',
  'deleteById',
]);

module.exports = CustomerRepositoryProvider;
