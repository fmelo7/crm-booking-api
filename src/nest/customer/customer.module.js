const { Module } = require('@nestjs/common');
const CustomerController = require('./customer.controller');
const CustomerProvider = require('./customer.provider');
const CustomerRepositoryProvider = require('./customer.repository.provider');
const AppointmentRepositoryProvider = require('../appointment/appointment.repository.provider');

class CustomerModule {}

Module({
  controllers: [CustomerController],
  providers: [
    AppointmentRepositoryProvider,
    CustomerProvider,
    CustomerRepositoryProvider,
  ],
})(CustomerModule);

module.exports = CustomerModule;
