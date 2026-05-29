require('reflect-metadata');

const ProfessionalStandaloneModule = require('./nest/professional/professional.standalone.module');
const DocsModule = require('./nest/docs/docs.module');
const HealthModule = require('./nest/health/health.module');
const MetricsModule = require('./nest/metrics/metrics.module');
const { defineModule } = require('./nest/common/module');

const ProfessionalsServiceModule = defineModule({
  imports: [
    ProfessionalStandaloneModule,
    DocsModule,
    HealthModule,
    MetricsModule,
  ],
});

module.exports = ProfessionalsServiceModule;
