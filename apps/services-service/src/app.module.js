require('reflect-metadata');

const ServiceModule = require('../../../src/nest/service/service.module');
const HealthModule = require('../../../src/nest/health/health.module');
const { defineModule } = require('../../../src/nest/common/module');

const ServicesServiceModule = defineModule({
  imports: [
    ServiceModule,
    HealthModule,
  ],
});

module.exports = ServicesServiceModule;
