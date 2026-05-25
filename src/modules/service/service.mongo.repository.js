const Service = require('./service.model');
const { paginate } = require('../common/pagination');
const { mapPaginated, mapService } = require('../common/repositoryMappers');

exports.create = async (data) => mapService(await Service.create(data));

exports.paginate = async (query, options) =>
  mapPaginated(await paginate(Service, query, options), mapService);

exports.findById = async (id) => mapService(await Service.findById(id));

exports.updateById = (id, data) =>
  Service.findByIdAndUpdate(id, data, { new: true, runValidators: true })
    .then(mapService);

exports.deleteById = async (id) => mapService(await Service.findByIdAndDelete(id));
