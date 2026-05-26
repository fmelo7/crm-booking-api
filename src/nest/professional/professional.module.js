const { Module } = require('@nestjs/common');
const ProfessionalController = require('./professional.controller');
const ProfessionalProvider = require('./professional.provider');
const RepositoryModule = require('../repository/repository.module');

class ProfessionalModule {}

Module({
  imports: [RepositoryModule],
  controllers: [ProfessionalController],
  providers: [ProfessionalProvider],
})(ProfessionalModule);

module.exports = ProfessionalModule;
