const { getRepositoryProvider } = require('../../shared/common/databaseProvider');

module.exports = require(`./infrastructure/${getRepositoryProvider()}/appointment.repository`);
