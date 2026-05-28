require('reflect-metadata');

const CustomerStandaloneModule = require('../../../src/nest/customer/customer.standalone.module');
const HealthModule = require('../../../src/nest/health/health.module');
const { defineModule } = require('../../../src/nest/common/module');

const CustomersServiceModule = defineModule({
  imports: [
    CustomerStandaloneModule,
    HealthModule,
  ],
});

module.exports = CustomersServiceModule;
