const service = require('./service.service');

exports.create = async (req, res) => {
  const result = await service.createService(req.body);
  res.status(201).json(result);
};

exports.list = async (req, res) => {
  const result = await service.getServices(req.query);
  res.json(result);
};

exports.getById = async (req, res) => {
  const result = await service.getServiceById(req.params.id);
  res.json(result);
};

exports.update = async (req, res) => {
  const result = await service.updateService(req.params.id, req.body);
  res.json(result);
};

exports.remove = async (req, res) => {
  await service.deleteService(req.params.id);
  res.status(204).end();
};
