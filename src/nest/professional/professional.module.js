const { Module } = require('@nestjs/common');
const ProfessionalController = require('./professional.controller');
const ProfessionalProvider = require('./professional.provider');
const ProfessionalRepositoryProvider = require('./professional.repository.provider');
const AppointmentRepositoryProvider = require('../appointment/appointment.repository.provider');

class ProfessionalModule {}

Module({
  controllers: [ProfessionalController],
  providers: [
    AppointmentRepositoryProvider,
    ProfessionalProvider,
    ProfessionalRepositoryProvider,
  ],
})(ProfessionalModule);

module.exports = ProfessionalModule;
