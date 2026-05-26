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
const ProfessionalProvider = require('./professional.provider');
const {
  createProfessionalSchema,
  listProfessionalSchema,
} = require('../../modules/professional/professional.validation');
const { idParamSchema } = require('../../modules/common/validation');
const {
  parseBody,
  parseIdParam,
  parseQuery,
} = require('../common/zod');

class ProfessionalController {
  constructor(professionalProvider) {
    this.professionalProvider = professionalProvider;
  }

  list(query) {
    return this.professionalProvider.list(parseQuery(listProfessionalSchema, query));
  }

  getById(id) {
    return this.professionalProvider.getById(parseIdParam(idParamSchema, id));
  }

  create(body) {
    return this.professionalProvider.create(parseBody(createProfessionalSchema, body));
  }

  update(id, body) {
    return this.professionalProvider.update(
      parseIdParam(idParamSchema, id),
      parseBody(createProfessionalSchema, body)
    );
  }

  async remove(id) {
    await this.professionalProvider.remove(parseIdParam(idParamSchema, id));
  }
}

Reflect.defineMetadata('design:paramtypes', [ProfessionalProvider], ProfessionalController);

Controller('api/professionals')(ProfessionalController);

Get()(ProfessionalController.prototype, 'list', Object.getOwnPropertyDescriptor(ProfessionalController.prototype, 'list'));
Query()(ProfessionalController.prototype, 'list', 0);

Get(':id')(ProfessionalController.prototype, 'getById', Object.getOwnPropertyDescriptor(ProfessionalController.prototype, 'getById'));
Param('id')(ProfessionalController.prototype, 'getById', 0);

Post()(ProfessionalController.prototype, 'create', Object.getOwnPropertyDescriptor(ProfessionalController.prototype, 'create'));
HttpCode(201)(ProfessionalController.prototype, 'create', Object.getOwnPropertyDescriptor(ProfessionalController.prototype, 'create'));
Body()(ProfessionalController.prototype, 'create', 0);

Put(':id')(ProfessionalController.prototype, 'update', Object.getOwnPropertyDescriptor(ProfessionalController.prototype, 'update'));
Param('id')(ProfessionalController.prototype, 'update', 0);
Body()(ProfessionalController.prototype, 'update', 1);

Delete(':id')(ProfessionalController.prototype, 'remove', Object.getOwnPropertyDescriptor(ProfessionalController.prototype, 'remove'));
HttpCode(204)(ProfessionalController.prototype, 'remove', Object.getOwnPropertyDescriptor(ProfessionalController.prototype, 'remove'));
Param('id')(ProfessionalController.prototype, 'remove', 0);

module.exports = ProfessionalController;
