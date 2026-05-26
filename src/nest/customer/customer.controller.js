require('reflect-metadata');

const {
  Body,
  Controller,
  Delete,
  Get,
  HttpCode,
  Param,
  Post,
  Put,
  Query,
} = require('@nestjs/common');
const CustomerProvider = require('./customer.provider');
const {
  createCustomerSchema,
  listCustomerSchema,
} = require('../../modules/customer/customer.validation');
const { idParamSchema } = require('../../modules/common/validation');
const { parseSchema } = require('../common/zod');

class CustomerController {
  constructor(customerProvider) {
    this.customerProvider = customerProvider;
  }

  list(query) {
    return this.customerProvider.list(parseSchema(listCustomerSchema, query));
  }

  getById(id) {
    parseSchema(idParamSchema, { id });
    return this.customerProvider.getById(id);
  }

  async create(body) {
    return this.customerProvider.create(parseSchema(createCustomerSchema, body));
  }

  update(id, body) {
    parseSchema(idParamSchema, { id });
    return this.customerProvider.update(id, parseSchema(createCustomerSchema, body));
  }

  async remove(id) {
    parseSchema(idParamSchema, { id });
    await this.customerProvider.remove(id);
  }
}

Reflect.defineMetadata('design:paramtypes', [CustomerProvider], CustomerController);

Controller('api/customers')(CustomerController);

Get()(CustomerController.prototype, 'list', Object.getOwnPropertyDescriptor(CustomerController.prototype, 'list'));
Query()(CustomerController.prototype, 'list', 0);

Get(':id')(CustomerController.prototype, 'getById', Object.getOwnPropertyDescriptor(CustomerController.prototype, 'getById'));
Param('id')(CustomerController.prototype, 'getById', 0);

Post()(CustomerController.prototype, 'create', Object.getOwnPropertyDescriptor(CustomerController.prototype, 'create'));
HttpCode(201)(CustomerController.prototype, 'create', Object.getOwnPropertyDescriptor(CustomerController.prototype, 'create'));
Body()(CustomerController.prototype, 'create', 0);

Put(':id')(CustomerController.prototype, 'update', Object.getOwnPropertyDescriptor(CustomerController.prototype, 'update'));
Param('id')(CustomerController.prototype, 'update', 0);
Body()(CustomerController.prototype, 'update', 1);

Delete(':id')(CustomerController.prototype, 'remove', Object.getOwnPropertyDescriptor(CustomerController.prototype, 'remove'));
HttpCode(204)(CustomerController.prototype, 'remove', Object.getOwnPropertyDescriptor(CustomerController.prototype, 'remove'));
Param('id')(CustomerController.prototype, 'remove', 0);

module.exports = CustomerController;
