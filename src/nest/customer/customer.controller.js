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
const {
  parseBody,
  parseIdParam,
  parseQuery,
} = require('../common/zod');

class CustomerController {
  constructor(customerProvider) {
    this.customerProvider = customerProvider;
  }

  list(query) {
    return this.customerProvider.list(parseQuery(listCustomerSchema, query));
  }

  getById(id) {
    return this.customerProvider.getById(parseIdParam(idParamSchema, id));
  }

  async create(body) {
    return this.customerProvider.create(parseBody(createCustomerSchema, body));
  }

  update(id, body) {
    return this.customerProvider.update(
      parseIdParam(idParamSchema, id),
      parseBody(createCustomerSchema, body)
    );
  }

  async remove(id) {
    await this.customerProvider.remove(parseIdParam(idParamSchema, id));
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
