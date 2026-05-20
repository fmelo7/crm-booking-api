const Service = require('./service.model');

exports.createService = async (data) => {
  const { name } = data;

  if (!name) {
    throw { status: 400, message: 'Nome do serviço é obrigatório' };
  }

  return Service.create(data);
};

exports.getServices = async () => Service.find();

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
