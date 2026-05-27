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
} = require('../../../packages/domains/customer/customer.validation');
const { idParamSchema } = require('../../../packages/shared/common/validation');
const {
  parseBody,
  parseIdParam,
  parseQuery,
} = require('../common/zod');
const {
  decorateMethod,
  decorateParam,
} = require('../common/decorators');
const { setParamTypes } = require('../common/injection');

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

setParamTypes(CustomerController, [CustomerProvider]);

Controller('api/customers')(CustomerController);

decorateMethod(CustomerController, 'list', [Get()]);
decorateParam(CustomerController, 'list', 0, Query());

decorateMethod(CustomerController, 'getById', [Get(':id')]);
decorateParam(CustomerController, 'getById', 0, Param('id'));

decorateMethod(CustomerController, 'create', [Post(), HttpCode(201)]);
decorateParam(CustomerController, 'create', 0, Body());

decorateMethod(CustomerController, 'update', [Put(':id')]);
decorateParam(CustomerController, 'update', 0, Param('id'));
decorateParam(CustomerController, 'update', 1, Body());

decorateMethod(CustomerController, 'remove', [Delete(':id'), HttpCode(204)]);
decorateParam(CustomerController, 'remove', 0, Param('id'));

module.exports = CustomerController;
