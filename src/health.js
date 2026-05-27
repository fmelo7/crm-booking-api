const { getDatabaseProvider } = require('../packages/shared/common/databaseProvider');
const { getPostgresUri } = require('./config/postgres');
const { getMaskedEnv, isEnvDebugEnabled, maskValue } = require('./config/envDebug');
const { getServiceName } = require('./middlewares/logger');

const buildHealthResponse = (req, dbConnected) => {
  const databaseProvider = getDatabaseProvider();

  return {
    status: dbConnected ? 'ok' : 'degraded',
    dbConnected,
    debug: isEnvDebugEnabled() ? {
      database: {
        provider: databaseProvider,
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
