const ProfessionalController = require('./professional.controller');
const ProfessionalProvider = require('./professional.provider');
const ProfessionalRepositoryProvider = require('./professional.repository.provider');
const { defineModule } = require('../common/module');

const ProfessionalStandaloneModule = defineModule({
  controllers: [ProfessionalController],
  providers: [
    ProfessionalRepositoryProvider,
    ProfessionalProvider,
  ],
});

module.exports = ProfessionalStandaloneModule;
