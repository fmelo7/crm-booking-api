const professionalRepository = require('./professional.repository');
const appointmentRepository = require('../appointment/appointment.repository');

const escapeRegExp = (value) => value.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');

exports.createProfessional = async (data) => {
  const { name, category } = data;

  if (!name || !category) {
    throw { status: 400, message: 'Nome e categoria são obrigatórios' };
  }

  return professionalRepository.create(data);
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

  return professionalRepository.paginate(query, {
    page: filters.page,
    limit: filters.limit,
    sort: { name: 1 },
  });
};

exports.getProfessionalById = async (id) => {
  const item = await professionalRepository.findById(id);
  if (!item) throw { status: 404, message: 'Profissional não encontrado' };
  return item;
};

exports.updateProfessional = async (id, data) => {
  const item = await professionalRepository.updateById(id, data);
  if (!item) throw { status: 404, message: 'Profissional não encontrado' };
  return item;
};

exports.deleteProfessional = async (id) => {
  const appointment = await appointmentRepository.existsForProfessional(id);
  if (appointment) {
    throw { status: 409, message: 'Profissional possui agendamentos vinculados e não pode ser removido' };
  }

  const item = await professionalRepository.deleteById(id);
  if (!item) throw { status: 404, message: 'Profissional não encontrado' };
  return item;
};
