const ServiceController = require('./service.controller');
const ServiceProvider = require('./service.provider');
const ServiceRepositoryProvider = require('./service.repository.provider');
const { defineModule } = require('../common/module');

const ServiceStandaloneModule = defineModule({
  controllers: [ServiceController],
  providers: [
    ServiceRepositoryProvider,
    ServiceProvider,
  ],
});

module.exports = ServiceStandaloneModule;
