const { Injectable } = require('@nestjs/common');
const CustomerRepositoryProvider = require('./customer.repository.provider');
const AppointmentRepositoryProvider = require('../appointment/appointment.repository.provider');

const escapeRegExp = (value) => value.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');

class CustomerProvider {
  constructor(customerRepository, appointmentRepository) {
    this.customerRepository = customerRepository;
    this.appointmentRepository = appointmentRepository;
  }

  create(data) {
    const { name } = data;

    if (!name) {
      throw { status: 400, message: 'Nome do cliente é obrigatório' };
    }

    return this.customerRepository.create(data);
  }

  list(filters) {
    const query = {};

    if (filters.search) {
      const search = new RegExp(escapeRegExp(filters.search), 'i');
      query.$or = [
        { name: search },
        { email: search },
        { phone: search },
      ];
    }

    return this.customerRepository.paginate(query, {
      page: filters.page,
      limit: filters.limit,
      sort: { name: 1 },
    });
  }

  async getById(id) {
    const item = await this.customerRepository.findById(id);
    if (!item) throw { status: 404, message: 'Cliente não encontrado' };
    return item;
  }

  async update(id, data) {
    const item = await this.customerRepository.updateById(id, data);
    if (!item) throw { status: 404, message: 'Cliente não encontrado' };
    return item;
  }

  async remove(id) {
    const appointment = await this.appointmentRepository.existsForCustomer(id);
    if (appointment) {
      throw { status: 409, message: 'Cliente possui agendamentos vinculados e não pode ser removido' };
    }

    const item = await this.customerRepository.deleteById(id);
    if (!item) throw { status: 404, message: 'Cliente não encontrado' };
    return item;
  }
}

Reflect.defineMetadata(
  'design:paramtypes',
  [CustomerRepositoryProvider, AppointmentRepositoryProvider],
  CustomerProvider
);
Injectable()(CustomerProvider);

module.exports = CustomerProvider;
