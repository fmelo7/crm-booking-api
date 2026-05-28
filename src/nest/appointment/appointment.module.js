const AppointmentController = require('./appointment.controller');
const AppointmentProvider = require('./appointment.provider');
const AppointmentRepositoryProvider = require('./appointment.repository.provider');
const CustomerRepositoryProvider = require('../customer/customer.repository.provider');
const ProfessionalRepositoryProvider = require('../professional/professional.repository.provider');
const RepositoryModule = require('../repository/repository.module');
const ServiceRepositoryProvider = require('../service/service.repository.provider');
const { defineModule } = require('../common/module');

const appointmentProvider = {
  provide: AppointmentProvider,
  useFactory: (
    appointmentRepository,
    customerRepository,
    serviceRepository,
    professionalRepository
  ) => new AppointmentProvider(appointmentRepository, {
    findCustomer: (id) => customerRepository.findById(id),
    findService: (id) => serviceRepository.findById(id),
    findProfessional: (id) => professionalRepository.findById(id),
  }),
  inject: [
    AppointmentRepositoryProvider,
    CustomerRepositoryProvider,
    ServiceRepositoryProvider,
    ProfessionalRepositoryProvider,
  ],
};

const AppointmentModule = defineModule({
  imports: [RepositoryModule],
  controllers: [AppointmentController],
  providers: [appointmentProvider],
});

module.exports = AppointmentModule;
