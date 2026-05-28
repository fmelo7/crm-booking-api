require('reflect-metadata');

const ProfessionalStandaloneModule = require('./nest/professional/professional.standalone.module');
const HealthModule = require('./nest/health/health.module');
const { defineModule } = require('./nest/common/module');

const ProfessionalsServiceModule = defineModule({
  imports: [
    ProfessionalStandaloneModule,
    HealthModule,
  ],
});

module.exports = ProfessionalsServiceModule;
