const serviceRepository = require('./service.repository');
const appointmentRepository = require('../appointment/appointment.repository');

const escapeRegExp = (value) => value.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');

exports.createService = async (data) => {
  const { name } = data;

  if (!name) {
    throw { status: 400, message: 'Nome do serviço é obrigatório' };
  }

  return serviceRepository.create(data);
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

  return serviceRepository.paginate(query, {
    page: filters.page,
    limit: filters.limit,
    sort: { name: 1 },
  });
};

exports.getServiceById = async (id) => {
  const item = await serviceRepository.findById(id);
  if (!item) throw { status: 404, message: 'Serviço não encontrado' };
  return item;
};

exports.updateService = async (id, data) => {
  const item = await serviceRepository.updateById(id, data);
  if (!item) throw { status: 404, message: 'Serviço não encontrado' };
  return item;
};

exports.deleteService = async (id) => {
  const appointment = await appointmentRepository.existsForService(id);
  if (appointment) {
    throw { status: 409, message: 'Serviço possui agendamentos vinculados e não pode ser removido' };
  }

  const item = await serviceRepository.deleteById(id);
  if (!item) throw { status: 404, message: 'Serviço não encontrado' };
  return item;
};
