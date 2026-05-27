require('reflect-metadata');

const ProfessionalModule = require('../../../src/nest/professional/professional.module');
const HealthModule = require('../../../src/nest/health/health.module');
const { defineModule } = require('../../../src/nest/common/module');

const ProfessionalsServiceModule = defineModule({
  imports: [
    ProfessionalModule,
    HealthModule,
  ],
});

module.exports = ProfessionalsServiceModule;
