const { getDatabaseProvider } = require('./shared/common/databaseProvider');
const { getPostgresUri } = require('./config/postgres');
const { readServiceDatabaseEnv } = require('./config/serviceDatabase');
const { getMaskedEnv, isEnvDebugEnabled, maskValue } = require('./config/envDebug');
const { getServiceName } = require('./middlewares/logger');

const buildHealthResponse = (req, dbConnected) => {
  const databaseProvider = getDatabaseProvider();
  const serviceDatabase = readServiceDatabaseEnv();

  return {
    status: dbConnected ? 'ok' : 'degraded',
    dbConnected,
    dependencies: {
      database: {
        status: dbConnected ? 'ok' : 'degraded',
        provider: databaseProvider,
        domain: serviceDatabase.domain,
        ownConnection: databaseProvider === 'postgres'
          ? serviceDatabase.hasOwnPostgresUri
          : serviceDatabase.hasOwnMongoUri,
      },
    },
    debug: isEnvDebugEnabled() ? {
      database: {
        provider: databaseProvider,
        serviceName: serviceDatabase.serviceName,
        domain: serviceDatabase.domain,
        ownConnection: databaseProvider === 'postgres'
          ? serviceDatabase.hasOwnPostgresUri
          : serviceDatabase.hasOwnMongoUri,
        hasDatabaseUrl: Boolean(process.env.DATABASE_URL),
        hasPostgresUri: Boolean(process.env.POSTGRES_URI),
        hasMongoUri: Boolean(process.env.MONGODB_URI),
        resolvedPostgresUri: databaseProvider === 'postgres'
          ? maskValue('POSTGRES_URI', getPostgresUri())
          : undefined,
      },
      env: getMaskedEnv(),
    } : undefined,
    uptime: process.uptime(),
    timestamp: new Date().toISOString(),
    service: getServiceName(),
    requestId: req.requestId,
    traceId: req.traceId,
  };
};

module.exports = {
  buildHealthResponse,
};
