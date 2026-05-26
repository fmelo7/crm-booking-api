const { Module } = require('@nestjs/common');
const ServiceController = require('./service.controller');
const ServiceProvider = require('./service.provider');
const RepositoryModule = require('../repository/repository.module');

class ServiceModule {}

Module({
  imports: [RepositoryModule],
  controllers: [ServiceController],
  providers: [ServiceProvider],
})(ServiceModule);

module.exports = ServiceModule;
