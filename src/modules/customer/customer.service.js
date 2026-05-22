const Customer = require('./customer.model');
const { paginate } = require('../common/pagination');

const escapeRegExp = (value) => value.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');

exports.createCustomer = async (data) => {
  const { name } = data;

  if (!name) {
    throw { status: 400, message: 'Nome do cliente é obrigatório' };
  }

  return Customer.create(data);
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

  return paginate(Customer, query, {
    page: filters.page,
    limit: filters.limit,
    sort: { name: 1 },
  });
};

exports.getCustomerById = async (id) => {
  const item = await Customer.findById(id);
  if (!item) throw { status: 404, message: 'Cliente não encontrado' };
  return item;
};

exports.updateCustomer = async (id, data) => {
  const item = await Customer.findByIdAndUpdate(id, data, { new: true, runValidators: true });
  if (!item) throw { status: 404, message: 'Cliente não encontrado' };
  return item;
};

exports.deleteCustomer = async (id) => {
  const item = await Customer.findByIdAndDelete(id);
  if (!item) throw { status: 404, message: 'Cliente não encontrado' };
  return item;
};
