require('reflect-metadata');

const { Module } = require('@nestjs/common');
const CustomerModule = require('./customer/customer.module');
const ServiceModule = require('./service/service.module');

class AppModule {}

Module({
  imports: [CustomerModule, ServiceModule],
})(AppModule);

module.exports = AppModule;
