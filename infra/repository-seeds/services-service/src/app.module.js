require('reflect-metadata');

const ServiceStandaloneModule = require('./nest/service/service.standalone.module');
const HealthModule = require('./nest/health/health.module');
const { defineModule } = require('./nest/common/module');

const ServicesServiceModule = defineModule({
  imports: [
    ServiceStandaloneModule,
    HealthModule,
  ],
});

module.exports = ServicesServiceModule;
