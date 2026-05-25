const { getRepositoryProvider } = require('../common/databaseProvider');

module.exports = require(`./service.${getRepositoryProvider()}.repository`);
