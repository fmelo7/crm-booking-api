require('reflect-metadata');

const {
  Body,
  Controller,
  Delete,
  Get,
  HttpCode,
  Param,
  Patch,
  Post,
  Put,
  Query,
} = require('@nestjs/common');
const AppointmentProvider = require('./appointment.provider');
const {
  availabilityAppointmentSchema,
  createAppointmentSchema,
  filterAppointmentSchema,
  idParamSchema,
  rescheduleAppointmentSchema,
} = require('../../modules/appointment/appointment.validation');
const {
  parseBody,
  parseIdParam,
  parseQuery,
} = require('../common/zod');
const {
  decorateMethod,
  decorateParam,
} = require('../common/decorators');

class AppointmentController {
  constructor(appointmentProvider) {
    this.appointmentProvider = appointmentProvider;
  }

  getAvailability(query) {
    return this.appointmentProvider.getAvailability(
      parseQuery(availabilityAppointmentSchema, query)
    );
  }

  list(query) {
    return this.appointmentProvider.list(parseQuery(filterAppointmentSchema, query));
  }

  getById(id) {
    return this.appointmentProvider.getById(parseIdParam(idParamSchema, id));
  }

  create(body) {
    return this.appointmentProvider.create(parseBody(createAppointmentSchema, body));
  }

  reschedule(id, body) {
    return this.appointmentProvider.reschedule(
      parseIdParam(idParamSchema, id),
      parseBody(rescheduleAppointmentSchema, body)
    );
  }

  complete(id) {
    return this.appointmentProvider.complete(parseIdParam(idParamSchema, id));
  }

  cancel(id) {
    return this.appointmentProvider.cancel(parseIdParam(idParamSchema, id));
  }
}

Reflect.defineMetadata('design:paramtypes', [AppointmentProvider], AppointmentController);

Controller('api/appointments')(AppointmentController);

decorateMethod(AppointmentController, 'getAvailability', [Get('availability')]);
decorateParam(AppointmentController, 'getAvailability', 0, Query());

decorateMethod(AppointmentController, 'list', [Get()]);
decorateParam(AppointmentController, 'list', 0, Query());

decorateMethod(AppointmentController, 'getById', [Get(':id')]);
decorateParam(AppointmentController, 'getById', 0, Param('id'));

decorateMethod(AppointmentController, 'create', [Post(), HttpCode(201)]);
decorateParam(AppointmentController, 'create', 0, Body());

decorateMethod(AppointmentController, 'reschedule', [Put(':id/reschedule')]);
decorateParam(AppointmentController, 'reschedule', 0, Param('id'));
decorateParam(AppointmentController, 'reschedule', 1, Body());

decorateMethod(AppointmentController, 'complete', [Patch(':id/complete')]);
decorateParam(AppointmentController, 'complete', 0, Param('id'));

decorateMethod(AppointmentController, 'cancel', [Delete(':id/cancel')]);
decorateParam(AppointmentController, 'cancel', 0, Param('id'));

module.exports = AppointmentController;
