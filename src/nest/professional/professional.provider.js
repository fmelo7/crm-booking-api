const { Injectable } = require('@nestjs/common');
const professionalService = require('../../modules/professional/professional.service');

class ProfessionalProvider {
  create(data) {
    return professionalService.createProfessional(data);
  }

  list(filters) {
    return professionalService.getProfessionals(filters);
  }

  getById(id) {
    return professionalService.getProfessionalById(id);
  }

  update(id, data) {
    return professionalService.updateProfessional(id, data);
  }

  remove(id) {
    return professionalService.deleteProfessional(id);
  }
}

Injectable()(ProfessionalProvider);

module.exports = ProfessionalProvider;
