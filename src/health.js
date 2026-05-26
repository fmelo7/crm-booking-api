const { getDatabaseProvider } = require('./modules/common/databaseProvider');
const { getPostgresUri } = require('./config/postgres');
const { getMaskedEnv, isEnvDebugEnabled, maskValue } = require('./config/envDebug');

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
    requestId: req.requestId,
  };
};

const healthHandler = (req, res) => {
  const dbConnected = req.app.get('dbConnected');
  res.status(dbConnected ? 200 : 503).json(buildHealthResponse(req, dbConnected));
};

module.exports = {
  buildHealthResponse,
  healthHandler,
};
