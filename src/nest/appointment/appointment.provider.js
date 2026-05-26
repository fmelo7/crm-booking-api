const { Injectable } = require('@nestjs/common');
const appointmentService = require('../../modules/appointment/appointment.service');

class AppointmentProvider {
  create(data) {
    return appointmentService.createAppointment(data);
  }

  list(filters) {
    return appointmentService.getAllAppointments(filters);
  }

  getById(id) {
    return appointmentService.getAppointmentById(id);
  }

  reschedule(id, data) {
    return appointmentService.rescheduleAppointment(id, data);
  }

  cancel(id) {
    return appointmentService.cancelAppointment(id);
  }

  complete(id) {
    return appointmentService.completeAppointment(id);
  }

  getAvailability(filters) {
    return appointmentService.getAvailability(filters);
  }
}

Injectable()(AppointmentProvider);

module.exports = AppointmentProvider;
