const CustomerController = require('./customer.controller');
const CustomerProvider = require('./customer.provider');
const CustomerRepositoryProvider = require('./customer.repository.provider');
const { defineModule } = require('../common/module');

const CustomerStandaloneModule = defineModule({
  controllers: [CustomerController],
  providers: [
    CustomerRepositoryProvider,
    CustomerProvider,
  ],
});

module.exports = CustomerStandaloneModule;
