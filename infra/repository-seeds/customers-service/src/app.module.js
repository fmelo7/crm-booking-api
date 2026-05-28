require('reflect-metadata');

const CustomerStandaloneModule = require('./nest/customer/customer.standalone.module');
const HealthModule = require('./nest/health/health.module');
const { defineModule } = require('./nest/common/module');

const CustomersServiceModule = defineModule({
  imports: [
    CustomerStandaloneModule,
    HealthModule,
  ],
});

module.exports = CustomersServiceModule;
