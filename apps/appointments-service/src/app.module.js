require('reflect-metadata');

const AppointmentStandaloneModule = require('../../../src/nest/appointment/appointment.standalone.module');
const HealthModule = require('../../../src/nest/health/health.module');
const { defineModule } = require('../../../src/nest/common/module');

const AppointmentsServiceModule = defineModule({
  imports: [
    AppointmentStandaloneModule,
    HealthModule,
  ],
});

module.exports = AppointmentsServiceModule;
