const { getRepositoryProvider } = require('../common/databaseProvider');

module.exports = require(`./appointment.${getRepositoryProvider()}.repository`);
