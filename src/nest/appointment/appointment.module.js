const { Module } = require('@nestjs/common');
const AppointmentController = require('./appointment.controller');
const AppointmentProvider = require('./appointment.provider');
const RepositoryModule = require('../repository/repository.module');

class AppointmentModule {}

Module({
  imports: [RepositoryModule],
  controllers: [AppointmentController],
  providers: [AppointmentProvider],
})(AppointmentModule);

module.exports = AppointmentModule;
