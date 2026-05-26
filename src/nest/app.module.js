require('reflect-metadata');

const { Module } = require('@nestjs/common');
const AppointmentModule = require('./appointment/appointment.module');
const CustomerModule = require('./customer/customer.module');
const ProfessionalModule = require('./professional/professional.module');
const ServiceModule = require('./service/service.module');

class AppModule {}

Module({
  imports: [AppointmentModule, CustomerModule, ProfessionalModule, ServiceModule],
})(AppModule);

module.exports = AppModule;
