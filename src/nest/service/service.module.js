const { Module } = require('@nestjs/common');
const ServiceController = require('./service.controller');
const ServiceProvider = require('./service.provider');
const ServiceRepositoryProvider = require('./service.repository.provider');
const AppointmentRepositoryProvider = require('../appointment/appointment.repository.provider');

class ServiceModule {}

Module({
  controllers: [ServiceController],
  providers: [
    AppointmentRepositoryProvider,
    ServiceProvider,
    ServiceRepositoryProvider,
  ],
})(ServiceModule);

module.exports = ServiceModule;
