const { Module } = require('@nestjs/common');
const AppointmentController = require('./appointment.controller');
const AppointmentProvider = require('./appointment.provider');

class AppointmentModule {}

Module({
  controllers: [AppointmentController],
  providers: [AppointmentProvider],
})(AppointmentModule);

module.exports = AppointmentModule;
