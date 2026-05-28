const ServiceController = require('./service.controller');
const ServiceProvider = require('./service.provider');
const AppointmentRepositoryProvider = require('../appointment/appointment.repository.provider');
const RepositoryModule = require('../repository/repository.module');
const ServiceRepositoryProvider = require('./service.repository.provider');
const { defineModule } = require('../common/module');

const serviceProvider = {
  provide: ServiceProvider,
  useFactory: (serviceRepository, appointmentRepository) =>
    new ServiceProvider(serviceRepository, {
      existsForService: (id) => appointmentRepository.existsForService(id),
    }),
  inject: [ServiceRepositoryProvider, AppointmentRepositoryProvider],
};

const ServiceModule = defineModule({
  imports: [RepositoryModule],
  controllers: [ServiceController],
  providers: [serviceProvider],
});

module.exports = ServiceModule;
