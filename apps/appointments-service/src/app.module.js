require('reflect-metadata');

const AppointmentModule = require('../../../src/nest/appointment/appointment.module');
const HealthModule = require('../../../src/nest/health/health.module');
const { defineModule } = require('../../../src/nest/common/module');

const AppointmentsServiceModule = defineModule({
  imports: [
    AppointmentModule,
    HealthModule,
  ],
});

module.exports = AppointmentsServiceModule;
