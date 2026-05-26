const appointmentRepository = require('../../modules/appointment/appointment.repository');
const { createRepositoryProvider } = require('../common/repositoryProvider');

const AppointmentRepositoryProvider = createRepositoryProvider(appointmentRepository, [
  'create',
  'paginate',
  'findById',
  'findByIdPopulated',
  'findConflict',
  'findScheduledOverlapping',
  'existsForCustomer',
  'existsForService',
  'existsForProfessional',
]);

module.exports = AppointmentRepositoryProvider;
