const ProfessionalController = require('./professional.controller');
const ProfessionalProvider = require('./professional.provider');
const AppointmentRepositoryProvider = require('../appointment/appointment.repository.provider');
const ProfessionalRepositoryProvider = require('./professional.repository.provider');
const RepositoryModule = require('../repository/repository.module');
const { defineModule } = require('../common/module');

const professionalProvider = {
  provide: ProfessionalProvider,
  useFactory: (professionalRepository, appointmentRepository) =>
    new ProfessionalProvider(professionalRepository, {
      existsForProfessional: (id) => appointmentRepository.existsForProfessional(id),
    }),
  inject: [ProfessionalRepositoryProvider, AppointmentRepositoryProvider],
};

const ProfessionalModule = defineModule({
  imports: [RepositoryModule],
  controllers: [ProfessionalController],
  providers: [professionalProvider],
});

module.exports = ProfessionalModule;
