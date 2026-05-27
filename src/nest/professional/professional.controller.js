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
} = require('../../../packages/domains/professional/professional.validation');
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

setParamTypes(ProfessionalController, [ProfessionalProvider]);

Controller('api/professionals')(ProfessionalController);

decorateMethod(ProfessionalController, 'list', [Get()]);
decorateParam(ProfessionalController, 'list', 0, Query());

decorateMethod(ProfessionalController, 'getById', [Get(':id')]);
decorateParam(ProfessionalController, 'getById', 0, Param('id'));

decorateMethod(ProfessionalController, 'create', [Post(), HttpCode(201)]);
decorateParam(ProfessionalController, 'create', 0, Body());

decorateMethod(ProfessionalController, 'update', [Put(':id')]);
decorateParam(ProfessionalController, 'update', 0, Param('id'));
decorateParam(ProfessionalController, 'update', 1, Body());

decorateMethod(ProfessionalController, 'remove', [Delete(':id'), HttpCode(204)]);
decorateParam(ProfessionalController, 'remove', 0, Param('id'));

module.exports = ProfessionalController;
