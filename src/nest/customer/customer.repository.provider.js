const { Injectable } = require('@nestjs/common');
const customerRepository = require('../../modules/customer/customer.repository');

class CustomerRepositoryProvider {
  create(data) {
    return customerRepository.create(data);
  }

  paginate(query, options) {
    return customerRepository.paginate(query, options);
  }

  findById(id) {
    return customerRepository.findById(id);
  }

  updateById(id, data) {
    return customerRepository.updateById(id, data);
  }

  deleteById(id) {
    return customerRepository.deleteById(id);
  }
}

Injectable()(CustomerRepositoryProvider);

module.exports = CustomerRepositoryProvider;
