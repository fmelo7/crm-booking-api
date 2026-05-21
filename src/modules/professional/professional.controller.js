const service = require('./professional.service');
const { sendError } = require('../../middlewares/error');

exports.create = async (req, res) => {
  try {
    const result = await service.createProfessional(req.body);
    res.status(201).json(result);
  } catch (err) {
    sendError(res, err);
  }
};

exports.list = async (req, res) => {
  try {
    const result = await service.getProfessionals();
    res.json(result);
  } catch (err) {
    sendError(res, err);
  }
};

exports.getById = async (req, res) => {
  try {
    const result = await service.getProfessionalById(req.params.id);
    res.json(result);
  } catch (err) {
    sendError(res, err);
  }
};

exports.update = async (req, res) => {
  try {
    const result = await service.updateProfessional(req.params.id, req.body);
    res.json(result);
  } catch (err) {
    sendError(res, err);
  }
};

exports.remove = async (req, res) => {
  try {
    await service.deleteProfessional(req.params.id);
    res.status(204).end();
  } catch (err) {
    sendError(res, err);
  }
};
