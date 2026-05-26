const { Injectable } = require('@nestjs/common');
const appointmentRepository = require('../../modules/appointment/appointment.repository');

class AppointmentRepositoryProvider {
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
