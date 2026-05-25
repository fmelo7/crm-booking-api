const Customer = require('./customer.model');
const { paginate } = require('../common/pagination');
const { mapCustomer, mapPaginated } = require('../common/repositoryMappers');

exports.create = async (data) => mapCustomer(await Customer.create(data));

exports.paginate = async (query, options) =>
  mapPaginated(await paginate(Customer, query, options), mapCustomer);

exports.findById = async (id) => mapCustomer(await Customer.findById(id));

exports.updateById = (id, data) =>
  Customer.findByIdAndUpdate(id, data, { new: true, runValidators: true })
    .then(mapCustomer);

exports.deleteById = async (id) => mapCustomer(await Customer.findByIdAndDelete(id));
