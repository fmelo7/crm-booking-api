const { Module } = require('@nestjs/common');
const AppointmentRepositoryProvider = require('../appointment/appointment.repository.provider');
const CustomerRepositoryProvider = require('../customer/customer.repository.provider');
const ProfessionalRepositoryProvider = require('../professional/professional.repository.provider');
const ServiceRepositoryProvider = require('../service/service.repository.provider');

const repositoryProviders = [
  AppointmentRepositoryProvider,
  CustomerRepositoryProvider,
  ProfessionalRepositoryProvider,
  ServiceRepositoryProvider,
];

class RepositoryModule {}

Module({
  providers: repositoryProviders,
  exports: repositoryProviders,
})(RepositoryModule);

module.exports = RepositoryModule;
