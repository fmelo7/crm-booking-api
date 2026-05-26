const { Injectable } = require('@nestjs/common');
const serviceModule = require('../../modules/service/service.service');

class ServiceProvider {
  create(data) {
    return serviceModule.createService(data);
  }

  list(filters) {
    return serviceModule.getServices(filters);
  }

  getById(id) {
    return serviceModule.getServiceById(id);
  }

  update(id, data) {
    return serviceModule.updateService(id, data);
  }

  remove(id) {
    return serviceModule.deleteService(id);
  }
}

Injectable()(ServiceProvider);

module.exports = ServiceProvider;
