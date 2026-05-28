require('reflect-metadata');

const AppointmentStandaloneModule = require('./nest/appointment/appointment.standalone.module');
const HealthModule = require('./nest/health/health.module');
const { defineModule } = require('./nest/common/module');

const AppointmentsServiceModule = defineModule({
  imports: [
    AppointmentStandaloneModule,
    HealthModule,
  ],
});

module.exports = AppointmentsServiceModule;
