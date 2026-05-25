const Professional = require('./professional.model');
const { paginate } = require('../common/pagination');

const escapeRegExp = (value) => value.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');

exports.createProfessional = async (data) => {
  const { name, category } = data;

  if (!name || !category) {
    throw { status: 400, message: 'Nome e categoria são obrigatórios' };
  }

  return Professional.create(data);
};

exports.getProfessionals = async (filters = {}) => {
  const query = {};

  if (filters.search) {
    const search = new RegExp(escapeRegExp(filters.search), 'i');
    query.$or = [
      { name: search },
      { category: search },
      { email: search },
      { phone: search },
    ];
  }

  return paginate(Professional, query, {
    page: filters.page,
    limit: filters.limit,
    sort: { name: 1 },
  });
};

exports.getProfessionalById = async (id) => {
  const item = await Professional.findById(id);
  if (!item) throw { status: 404, message: 'Profissional não encontrado' };
  return item;
};

exports.updateProfessional = async (id, data) => {
  const item = await Professional.findByIdAndUpdate(id, data, { new: true, runValidators: true });
  if (!item) throw { status: 404, message: 'Profissional não encontrado' };
  return item;
};

exports.deleteProfessional = async (id) => {
  const item = await Professional.findByIdAndDelete(id);
  if (!item) throw { status: 404, message: 'Profissional não encontrado' };
  return item;
};
