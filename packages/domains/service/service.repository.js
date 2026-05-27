const { getRepositoryProvider } = require('../../shared/common/databaseProvider');

module.exports = require(`./service.${getRepositoryProvider()}.repository`);
