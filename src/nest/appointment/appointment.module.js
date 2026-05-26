const AppointmentController = require('./appointment.controller');
const AppointmentProvider = require('./appointment.provider');
const RepositoryModule = require('../repository/repository.module');
const { defineModule } = require('../common/module');

const AppointmentModule = defineModule({
  imports: [RepositoryModule],
  controllers: [AppointmentController],
  providers: [AppointmentProvider],
});

module.exports = AppointmentModule;
