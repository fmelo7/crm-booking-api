require('reflect-metadata');

const CustomerModule = require('../../../src/nest/customer/customer.module');
const HealthModule = require('../../../src/nest/health/health.module');
const { defineModule } = require('../../../src/nest/common/module');

const CustomersServiceModule = defineModule({
  imports: [
    CustomerModule,
    HealthModule,
  ],
});

module.exports = CustomersServiceModule;
