const { getRepositoryProvider } = require('../common/databaseProvider');

module.exports = require(`./customer.${getRepositoryProvider()}.repository`);
