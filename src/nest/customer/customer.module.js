const { Module } = require('@nestjs/common');
const CustomerController = require('./customer.controller');
const CustomerProvider = require('./customer.provider');
const RepositoryModule = require('../repository/repository.module');

class CustomerModule {}

Module({
  imports: [RepositoryModule],
  controllers: [CustomerController],
  providers: [CustomerProvider],
})(CustomerModule);

module.exports = CustomerModule;
