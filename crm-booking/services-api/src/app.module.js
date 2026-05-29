require('reflect-metadata');

const ServiceStandaloneModule = require('./nest/service/service.standalone.module');
const DocsModule = require('./nest/docs/docs.module');
const HealthModule = require('./nest/health/health.module');
const MetricsModule = require('./nest/metrics/metrics.module');
const { defineModule } = require('./nest/common/module');

const ServicesServiceModule = defineModule({
  imports: [
    ServiceStandaloneModule,
    DocsModule,
    HealthModule,
    MetricsModule,
  ],
});

module.exports = ServicesServiceModule;
