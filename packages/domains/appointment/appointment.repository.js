const { getRepositoryProvider } = require('../../shared/common/databaseProvider');

module.exports = require(`./appointment.${getRepositoryProvider()}.repository`);
