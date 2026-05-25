const Professional = require('./professional.model');
const { paginate } = require('../common/pagination');
const { mapPaginated, mapProfessional } = require('../common/repositoryMappers');

exports.create = async (data) => mapProfessional(await Professional.create(data));

exports.paginate = async (query, options) =>
  mapPaginated(await paginate(Professional, query, options), mapProfessional);

exports.findById = async (id) => mapProfessional(await Professional.findById(id));

exports.updateById = (id, data) =>
  Professional.findByIdAndUpdate(id, data, { new: true, runValidators: true })
    .then(mapProfessional);

exports.deleteById = async (id) => mapProfessional(await Professional.findByIdAndDelete(id));
