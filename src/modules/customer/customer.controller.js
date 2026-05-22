const service = require('./customer.service');

exports.create = async (req, res) => {
  const result = await service.createCustomer(req.body);
  res.status(201).json(result);
};

exports.list = async (req, res) => {
  const result = await service.getCustomers(req.query);
  res.json(result);
};

exports.getById = async (req, res) => {
  const result = await service.getCustomerById(req.params.id);
  res.json(result);
};

exports.update = async (req, res) => {
  const result = await service.updateCustomer(req.params.id, req.body);
  res.json(result);
};

exports.remove = async (req, res) => {
  await service.deleteCustomer(req.params.id);
  res.status(204).end();
};
