const AppointmentController = require('./appointment.controller');
const AppointmentProvider = require('./appointment.provider');
const AppointmentRepositoryProvider = require('./appointment.repository.provider');
const { defineModule } = require('../common/module');

const AppointmentStandaloneModule = defineModule({
  controllers: [AppointmentController],
  providers: [
    AppointmentRepositoryProvider,
    AppointmentProvider,
  ],
});

module.exports = AppointmentStandaloneModule;
