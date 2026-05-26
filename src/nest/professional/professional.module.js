const { Module } = require('@nestjs/common');
const ProfessionalController = require('./professional.controller');
const ProfessionalProvider = require('./professional.provider');

class ProfessionalModule {}

Module({
  controllers: [ProfessionalController],
  providers: [ProfessionalProvider],
})(ProfessionalModule);

module.exports = ProfessionalModule;
