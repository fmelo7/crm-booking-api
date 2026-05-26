require('reflect-metadata');

const { Module } = require('@nestjs/common');
const CustomerModule = require('./customer/customer.module');

class AppModule {}

Module({
  imports: [CustomerModule],
})(AppModule);

module.exports = AppModule;
