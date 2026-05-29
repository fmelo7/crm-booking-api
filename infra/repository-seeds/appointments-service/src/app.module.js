require('reflect-metadata');

const AppointmentStandaloneModule = require('./nest/appointment/appointment.standalone.module');
const DocsModule = require('./nest/docs/docs.module');
const HealthModule = require('./nest/health/health.module');
const MetricsModule = require('./nest/metrics/metrics.module');
const { defineModule } = require('./nest/common/module');

const AppointmentsServiceModule = defineModule({
  imports: [
    AppointmentStandaloneModule,
    DocsModule,
    HealthModule,
    MetricsModule,
  ],
});

module.exports = AppointmentsServiceModule;
