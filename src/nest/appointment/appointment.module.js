const { Module } = require('@nestjs/common');
const AppointmentController = require('./appointment.controller');
const AppointmentProvider = require('./appointment.provider');
const AppointmentRepositoryProvider = require('./appointment.repository.provider');
const CustomerRepositoryProvider = require('../customer/customer.repository.provider');
const ProfessionalRepositoryProvider = require('../professional/professional.repository.provider');
const ServiceRepositoryProvider = require('../service/service.repository.provider');

class AppointmentModule {}

Module({
  controllers: [AppointmentController],
  providers: [
    AppointmentProvider,
    AppointmentRepositoryProvider,
    CustomerRepositoryProvider,
    ProfessionalRepositoryProvider,
    ServiceRepositoryProvider,
  ],
})(AppointmentModule);

module.exports = AppointmentModule;
