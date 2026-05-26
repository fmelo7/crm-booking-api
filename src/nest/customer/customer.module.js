const { Module } = require('@nestjs/common');
const CustomerController = require('./customer.controller');
const CustomerProvider = require('./customer.provider');

class CustomerModule {}

Module({
  controllers: [CustomerController],
  providers: [CustomerProvider],
})(CustomerModule);

module.exports = CustomerModule;
