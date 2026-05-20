const Professional = require('./professional.model');

exports.createProfessional = async (data) => {
  const { name, category } = data;

  if (!name || !category) {
    throw { status: 400, message: 'Nome e categoria são obrigatórios' };
  }

  return Professional.create(data);
};

exports.getProfessionals = async () => Professional.find();

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
