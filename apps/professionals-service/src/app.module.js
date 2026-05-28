require('reflect-metadata');

const ProfessionalStandaloneModule = require('../../../src/nest/professional/professional.standalone.module');
const HealthModule = require('../../../src/nest/health/health.module');
const { defineModule } = require('../../../src/nest/common/module');

const ProfessionalsServiceModule = defineModule({
  imports: [
    ProfessionalStandaloneModule,
    HealthModule,
  ],
});

module.exports = ProfessionalsServiceModule;
