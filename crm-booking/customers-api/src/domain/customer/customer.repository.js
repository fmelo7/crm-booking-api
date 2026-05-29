const { getRepositoryProvider } = require('../../shared/common/databaseProvider');

module.exports = require(`./customer.${getRepositoryProvider()}.repository`);
