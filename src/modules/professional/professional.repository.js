const { getRepositoryProvider } = require('../common/databaseProvider');

module.exports = require(`./professional.${getRepositoryProvider()}.repository`);
