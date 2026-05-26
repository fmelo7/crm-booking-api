const ProfessionalController = require('./professional.controller');
const ProfessionalProvider = require('./professional.provider');
const RepositoryModule = require('../repository/repository.module');
const { defineModule } = require('../common/module');

const ProfessionalModule = defineModule({
  imports: [RepositoryModule],
  controllers: [ProfessionalController],
  providers: [ProfessionalProvider],
});

module.exports = ProfessionalModule;
