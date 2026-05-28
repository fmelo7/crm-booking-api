require('reflect-metadata');

const ServiceStandaloneModule = require('../../../src/nest/service/service.standalone.module');
const HealthModule = require('../../../src/nest/health/health.module');
const { defineModule } = require('../../../src/nest/common/module');

const ServicesServiceModule = defineModule({
  imports: [
    ServiceStandaloneModule,
    HealthModule,
  ],
});

module.exports = ServicesServiceModule;
