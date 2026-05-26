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
const {
  parseBody,
  parseIdParam,
  parseQuery,
} = require('../common/zod');
const {
  decorateMethod,
  decorateParam,
} = require('../common/decorators');

class ServiceController {
  constructor(serviceProvider) {
    this.serviceProvider = serviceProvider;
  }

  list(query) {
    return this.serviceProvider.list(parseQuery(listServiceSchema, query));
  }

  getById(id) {
    return this.serviceProvider.getById(parseIdParam(idParamSchema, id));
  }

  create(body) {
    return this.serviceProvider.create(parseBody(createServiceSchema, body));
  }

  update(id, body) {
    return this.serviceProvider.update(
      parseIdParam(idParamSchema, id),
      parseBody(createServiceSchema, body)
    );
  }

  async remove(id) {
    await this.serviceProvider.remove(parseIdParam(idParamSchema, id));
  }
}

Reflect.defineMetadata('design:paramtypes', [ServiceProvider], ServiceController);

Controller('api/services')(ServiceController);

decorateMethod(ServiceController, 'list', [Get()]);
decorateParam(ServiceController, 'list', 0, Query());

decorateMethod(ServiceController, 'getById', [Get(':id')]);
decorateParam(ServiceController, 'getById', 0, Param('id'));

decorateMethod(ServiceController, 'create', [Post(), HttpCode(201)]);
decorateParam(ServiceController, 'create', 0, Body());

decorateMethod(ServiceController, 'update', [Put(':id')]);
decorateParam(ServiceController, 'update', 0, Param('id'));
decorateParam(ServiceController, 'update', 1, Body());

decorateMethod(ServiceController, 'remove', [Delete(':id'), HttpCode(204)]);
decorateParam(ServiceController, 'remove', 0, Param('id'));

module.exports = ServiceController;
