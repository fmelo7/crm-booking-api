const customerRepository = require('./customer.repository');
const appointmentRepository = require('../appointment/appointment.repository');

const escapeRegExp = (value) => value.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');

exports.createCustomer = async (data) => {
  const { name } = data;

  if (!name) {
    throw { status: 400, message: 'Nome do cliente é obrigatório' };
  }

  return customerRepository.create(data);
};

exports.getCustomers = async (filters = {}) => {
  const query = {};

  if (filters.search) {
    const search = new RegExp(escapeRegExp(filters.search), 'i');
    query.$or = [
      { name: search },
      { email: search },
      { phone: search },
    ];
  }

  return customerRepository.paginate(query, {
    page: filters.page,
    limit: filters.limit,
    sort: { name: 1 },
  });
};

exports.getCustomerById = async (id) => {
  const item = await customerRepository.findById(id);
  if (!item) throw { status: 404, message: 'Cliente não encontrado' };
  return item;
};

exports.updateCustomer = async (id, data) => {
  const item = await customerRepository.updateById(id, data);
  if (!item) throw { status: 404, message: 'Cliente não encontrado' };
  return item;
};

exports.deleteCustomer = async (id) => {
  const appointment = await appointmentRepository.existsForCustomer(id);
  if (appointment) {
    throw { status: 409, message: 'Cliente possui agendamentos vinculados e não pode ser removido' };
  }

  const item = await customerRepository.deleteById(id);
  if (!item) throw { status: 404, message: 'Cliente não encontrado' };
  return item;
};
