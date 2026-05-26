const { Injectable } = require('@nestjs/common');
const professionalRepository = require('../../modules/professional/professional.repository');

class ProfessionalRepositoryProvider {
  create(data) {
    return professionalRepository.create(data);
  }

  paginate(query, options) {
    return professionalRepository.paginate(query, options);
  }

  findById(id) {
    return professionalRepository.findById(id);
  }

  updateById(id, data) {
    return professionalRepository.updateById(id, data);
  }

  deleteById(id) {
    return professionalRepository.deleteById(id);
  }
}

Injectable()(ProfessionalRepositoryProvider);

module.exports = ProfessionalRepositoryProvider;
