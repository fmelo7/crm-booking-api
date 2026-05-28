const CustomerController = require('./customer.controller');
const CustomerProvider = require('./customer.provider');
const AppointmentRepositoryProvider = require('../appointment/appointment.repository.provider');
const CustomerRepositoryProvider = require('./customer.repository.provider');
const RepositoryModule = require('../repository/repository.module');
const { defineModule } = require('../common/module');

const customerProvider = {
  provide: CustomerProvider,
  useFactory: (customerRepository, appointmentRepository) =>
    new CustomerProvider(customerRepository, {
      existsForCustomer: (id) => appointmentRepository.existsForCustomer(id),
    }),
  inject: [CustomerRepositoryProvider, AppointmentRepositoryProvider],
};

const CustomerModule = defineModule({
  imports: [RepositoryModule],
  controllers: [CustomerController],
  providers: [customerProvider],
});

module.exports = CustomerModule;
