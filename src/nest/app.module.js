require('reflect-metadata');

const AppointmentModule = require('./appointment/appointment.module');
const CustomerModule = require('./customer/customer.module');
const HealthModule = require('./health/health.module');
const ProfessionalModule = require('./professional/professional.module');
const ServiceModule = require('./service/service.module');
const { defineModule } = require('./common/module');

const AppModule = defineModule({
  imports: [
    AppointmentModule,
    CustomerModule,
    HealthModule,
    ProfessionalModule,
    ServiceModule,
  ],
});

module.exports = AppModule;
