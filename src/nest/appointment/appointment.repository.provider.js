const { Injectable } = require('@nestjs/common');
const appointmentRepository = require('../../modules/appointment/appointment.repository');

class AppointmentRepositoryProvider {
  create(data) {
    return appointmentRepository.create(data);
  }

  paginate(query, options) {
    return appointmentRepository.paginate(query, options);
  }

  findById(id) {
    return appointmentRepository.findById(id);
  }

  findByIdPopulated(id) {
    return appointmentRepository.findByIdPopulated(id);
  }

  findConflict(filters) {
    return appointmentRepository.findConflict(filters);
  }

  findScheduledOverlapping(filters) {
    return appointmentRepository.findScheduledOverlapping(filters);
  }

  existsForCustomer(id) {
    return appointmentRepository.existsForCustomer(id);
  }

  existsForService(id) {
    return appointmentRepository.existsForService(id);
  }

  existsForProfessional(id) {
    return appointmentRepository.existsForProfessional(id);
  }
}

Injectable()(AppointmentRepositoryProvider);

module.exports = AppointmentRepositoryProvider;
