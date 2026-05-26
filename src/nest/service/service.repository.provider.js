const { Injectable } = require('@nestjs/common');
const serviceRepository = require('../../modules/service/service.repository');

class ServiceRepositoryProvider {
  create(data) {
    return serviceRepository.create(data);
  }

  paginate(query, options) {
    return serviceRepository.paginate(query, options);
  }

  findById(id) {
    return serviceRepository.findById(id);
  }

  updateById(id, data) {
    return serviceRepository.updateById(id, data);
  }

  deleteById(id) {
    return serviceRepository.deleteById(id);
  }
}

Injectable()(ServiceRepositoryProvider);

module.exports = ServiceRepositoryProvider;
