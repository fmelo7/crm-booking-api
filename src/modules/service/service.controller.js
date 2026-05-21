const service = require('./service.service');
const { sendError } = require('../../middlewares/error');

exports.create = async (req, res) => {
  try {
    const result = await service.createService(req.body);
    res.status(201).json(result);
  } catch (err) {
    sendError(res, err);
  }
};

exports.list = async (req, res) => {
  try {
    const result = await service.getServices();
    res.json(result);
  } catch (err) {
    sendError(res, err);
  }
};

exports.getById = async (req, res) => {
  try {
    const result = await service.getServiceById(req.params.id);
    res.json(result);
  } catch (err) {
    sendError(res, err);
  }
};

exports.update = async (req, res) => {
  try {
    const result = await service.updateService(req.params.id, req.body);
    res.json(result);
  } catch (err) {
    sendError(res, err);
  }
};

exports.remove = async (req, res) => {
  try {
    await service.deleteService(req.params.id);
    res.status(204).end();
  } catch (err) {
    sendError(res, err);
  }
};
