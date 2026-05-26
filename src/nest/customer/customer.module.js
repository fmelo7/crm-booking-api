const CustomerController = require('./customer.controller');
const CustomerProvider = require('./customer.provider');
const RepositoryModule = require('../repository/repository.module');
const { defineModule } = require('../common/module');

const CustomerModule = defineModule({
  imports: [RepositoryModule],
  controllers: [CustomerController],
  providers: [CustomerProvider],
});

module.exports = CustomerModule;
