const ServiceController = require('./service.controller');
const ServiceProvider = require('./service.provider');
const RepositoryModule = require('../repository/repository.module');
const { defineModule } = require('../common/module');

const ServiceModule = defineModule({
  imports: [RepositoryModule],
  controllers: [ServiceController],
  providers: [ServiceProvider],
});

module.exports = ServiceModule;
