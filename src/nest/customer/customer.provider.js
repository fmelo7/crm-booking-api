const { Injectable } = require('@nestjs/common');
const customerService = require('../../modules/customer/customer.service');

class CustomerProvider {
  create(data) {
    return customerService.createCustomer(data);
  }

  list(filters) {
    return customerService.getCustomers(filters);
  }

  getById(id) {
    return customerService.getCustomerById(id);
  }

  update(id, data) {
    return customerService.updateCustomer(id, data);
  }

  remove(id) {
    return customerService.deleteCustomer(id);
  }
}

Injectable()(CustomerProvider);

module.exports = CustomerProvider;
