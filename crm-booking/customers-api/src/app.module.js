require('reflect-metadata');

const CustomerStandaloneModule = require('./nest/customer/customer.standalone.module');
const DocsModule = require('./nest/docs/docs.module');
const HealthModule = require('./nest/health/health.module');
const MetricsModule = require('./nest/metrics/metrics.module');
const { defineModule } = require('./nest/common/module');

const CustomersServiceModule = defineModule({
  imports: [
    CustomerStandaloneModule,
    DocsModule,
    HealthModule,
    MetricsModule,
  ],
});

module.exports = CustomersServiceModule;
