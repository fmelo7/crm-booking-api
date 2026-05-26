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

Get('availability')(AppointmentController.prototype, 'getAvailability', Object.getOwnPropertyDescriptor(AppointmentController.prototype, 'getAvailability'));
Query()(AppointmentController.prototype, 'getAvailability', 0);

Get()(AppointmentController.prototype, 'list', Object.getOwnPropertyDescriptor(AppointmentController.prototype, 'list'));
Query()(AppointmentController.prototype, 'list', 0);

Get(':id')(AppointmentController.prototype, 'getById', Object.getOwnPropertyDescriptor(AppointmentController.prototype, 'getById'));
Param('id')(AppointmentController.prototype, 'getById', 0);

Post()(AppointmentController.prototype, 'create', Object.getOwnPropertyDescriptor(AppointmentController.prototype, 'create'));
HttpCode(201)(AppointmentController.prototype, 'create', Object.getOwnPropertyDescriptor(AppointmentController.prototype, 'create'));
Body()(AppointmentController.prototype, 'create', 0);

Put(':id/reschedule')(AppointmentController.prototype, 'reschedule', Object.getOwnPropertyDescriptor(AppointmentController.prototype, 'reschedule'));
Param('id')(AppointmentController.prototype, 'reschedule', 0);
Body()(AppointmentController.prototype, 'reschedule', 1);

Patch(':id/complete')(AppointmentController.prototype, 'complete', Object.getOwnPropertyDescriptor(AppointmentController.prototype, 'complete'));
Param('id')(AppointmentController.prototype, 'complete', 0);

Delete(':id/cancel')(AppointmentController.prototype, 'cancel', Object.getOwnPropertyDescriptor(AppointmentController.prototype, 'cancel'));
Param('id')(AppointmentController.prototype, 'cancel', 0);

module.exports = AppointmentController;
