const AppointmentRepositoryProvider = require('../appointment/appointment.repository.provider');
const CustomerRepositoryProvider = require('../customer/customer.repository.provider');
const ProfessionalRepositoryProvider = require('../professional/professional.repository.provider');
const ServiceRepositoryProvider = require('../service/service.repository.provider');
const { defineModule } = require('../common/module');

const repositoryProviders = [
  AppointmentRepositoryProvider,
  CustomerRepositoryProvider,
  ProfessionalRepositoryProvider,
  ServiceRepositoryProvider,
];

const RepositoryModule = defineModule({
  providers: repositoryProviders,
  exports: repositoryProviders,
});

module.exports = RepositoryModule;
