const { getRepositoryProvider } = require('../../shared/common/databaseProvider');

module.exports = require(`./professional.${getRepositoryProvider()}.repository`);
