const Service = require('./service.model');
const { paginate } = require('../common/pagination');

const escapeRegExp = (value) => value.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');

exports.createService = async (data) => {
  const { name } = data;

  if (!name) {
    throw { status: 400, message: 'Nome do serviço é obrigatório' };
  }

  return Service.create(data);
};

exports.getServices = async (filters = {}) => {
  const query = {};

  if (filters.search) {
    const search = new RegExp(escapeRegExp(filters.search), 'i');
    query.$or = [
      { name: search },
      { description: search },
    ];
  }

  return paginate(Service, query, {
    page: filters.page,
    limit: filters.limit,
    sort: { name: 1 },
  });
};

exports.getServiceById = async (id) => {
  const item = await Service.findById(id);
  if (!item) throw { status: 404, message: 'Serviço não encontrado' };
  return item;
};

exports.updateService = async (id, data) => {
  const item = await Service.findByIdAndUpdate(id, data, { new: true, runValidators: true });
  if (!item) throw { status: 404, message: 'Serviço não encontrado' };
  return item;
};

exports.deleteService = async (id) => {
  const item = await Service.findByIdAndDelete(id);
  if (!item) throw { status: 404, message: 'Serviço não encontrado' };
  return item;
};
