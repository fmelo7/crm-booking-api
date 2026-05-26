const { Module } = require('@nestjs/common');
const ServiceController = require('./service.controller');
const ServiceProvider = require('./service.provider');

class ServiceModule {}

Module({
  controllers: [ServiceController],
  providers: [ServiceProvider],
})(ServiceModule);

module.exports = ServiceModule;
