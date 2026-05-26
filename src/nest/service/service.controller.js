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
const ServiceProvider = require('./service.provider');
const {
  createServiceSchema,
  listServiceSchema,
} = require('../../modules/service/service.validation');
const { idParamSchema } = require('../../modules/common/validation');
const { parseSchema } = require('../common/zod');

class ServiceController {
  constructor(serviceProvider) {
    this.serviceProvider = serviceProvider;
  }

  list(query) {
    return this.serviceProvider.list(parseSchema(listServiceSchema, query));
  }

  getById(id) {
    parseSchema(idParamSchema, { id });
    return this.serviceProvider.getById(id);
  }

  create(body) {
    return this.serviceProvider.create(parseSchema(createServiceSchema, body));
  }

  update(id, body) {
    parseSchema(idParamSchema, { id });
    return this.serviceProvider.update(id, parseSchema(createServiceSchema, body));
  }

  async remove(id) {
    parseSchema(idParamSchema, { id });
    await this.serviceProvider.remove(id);
  }
}

Reflect.defineMetadata('design:paramtypes', [ServiceProvider], ServiceController);

Controller('api/services')(ServiceController);

Get()(ServiceController.prototype, 'list', Object.getOwnPropertyDescriptor(ServiceController.prototype, 'list'));
Query()(ServiceController.prototype, 'list', 0);

Get(':id')(ServiceController.prototype, 'getById', Object.getOwnPropertyDescriptor(ServiceController.prototype, 'getById'));
Param('id')(ServiceController.prototype, 'getById', 0);

Post()(ServiceController.prototype, 'create', Object.getOwnPropertyDescriptor(ServiceController.prototype, 'create'));
HttpCode(201)(ServiceController.prototype, 'create', Object.getOwnPropertyDescriptor(ServiceController.prototype, 'create'));
Body()(ServiceController.prototype, 'create', 0);

Put(':id')(ServiceController.prototype, 'update', Object.getOwnPropertyDescriptor(ServiceController.prototype, 'update'));
Param('id')(ServiceController.prototype, 'update', 0);
Body()(ServiceController.prototype, 'update', 1);

Delete(':id')(ServiceController.prototype, 'remove', Object.getOwnPropertyDescriptor(ServiceController.prototype, 'remove'));
HttpCode(204)(ServiceController.prototype, 'remove', Object.getOwnPropertyDescriptor(ServiceController.prototype, 'remove'));
Param('id')(ServiceController.prototype, 'remove', 0);

module.exports = ServiceController;
