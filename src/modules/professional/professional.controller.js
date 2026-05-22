const service = require('./professional.service');

exports.create = async (req, res) => {
  const result = await service.createProfessional(req.body);
  res.status(201).json(result);
};

exports.list = async (req, res) => {
  const result = await service.getProfessionals(req.query);
  res.json(result);
};

exports.getById = async (req, res) => {
  const result = await service.getProfessionalById(req.params.id);
  res.json(result);
};

exports.update = async (req, res) => {
  const result = await service.updateProfessional(req.params.id, req.body);
  res.json(result);
};

exports.remove = async (req, res) => {
  await service.deleteProfessional(req.params.id);
  res.status(204).end();
};
