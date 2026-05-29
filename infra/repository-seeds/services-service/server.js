require('dotenv').config();

const { getDatabaseProvider } = require('./src/shared/common/databaseProvider');
const createServicesServiceApp = require('./createServicesServiceApp');
const { connectDatabase, maskDatabaseUri } = require('./src/config/database');
const { readServiceDatabaseEnv } = require('./src/config/serviceDatabase');
const { getMaskedEnv, isEnvDebugEnabled } = require('./src/config/envDebug');
const HealthState = require('./src/nest/health/health.state');
const { log } = require('./src/middlewares/logger');

const SERVICE_NAME = 'services-service';
process.env.SERVICE_NAME = SERVICE_NAME;
const PORT = process.env.SERVICES_SERVICE_PORT || process.env.PORT || 3003;
const DATABASE_PROVIDER = getDatabaseProvider();
const SERVICE_DATABASE = readServiceDatabaseEnv(SERVICE_NAME);
const DATABASE_CONNECT_RETRIES = Number(process.env.DATABASE_CONNECT_RETRIES || 10);
const DATABASE_CONNECT_RETRY_MS = Number(process.env.DATABASE_CONNECT_RETRY_MS || 3000);

const wait = (ms) => new Promise((resolve) => setTimeout(resolve, ms));

log('info', 'Services service database provider resolved', {
  databaseProvider: DATABASE_PROVIDER,
  databaseDomain: SERVICE_DATABASE.domain,
  hasOwnConnection: DATABASE_PROVIDER === 'postgres'
    ? SERVICE_DATABASE.hasOwnPostgresUri
    : SERVICE_DATABASE.hasOwnMongoUri,
});

if (isEnvDebugEnabled()) {
  log('info', 'Services service environment variables loaded', {
    env: getMaskedEnv(),
  });
}

const connectDatabaseWithRetry = async () => {
  let lastError;

  for (let attempt = 1; attempt <= DATABASE_CONNECT_RETRIES; attempt += 1) {
    try {
      return await connectDatabase({ serviceName: SERVICE_NAME });
    } catch (err) {
      lastError = err;
      log('warn', 'Services service database connection attempt failed', {
        databaseProvider: DATABASE_PROVIDER,
        attempt,
        attempts: DATABASE_CONNECT_RETRIES,
        retryInMs: attempt < DATABASE_CONNECT_RETRIES ? DATABASE_CONNECT_RETRY_MS : 0,
        error: {
          message: err.message,
        },
      });

      if (attempt < DATABASE_CONNECT_RETRIES) {
        await wait(DATABASE_CONNECT_RETRY_MS);
      }
    }
  }

  throw lastError;
};

const bootstrap = async () => {
  const { nestApp } = await createServicesServiceApp();
  const healthState = nestApp.get(HealthState);

  try {
    const uri = await connectDatabaseWithRetry();
    healthState.setDatabaseConnected(true);
    log('info', 'Services service database connected', {
      databaseProvider: DATABASE_PROVIDER,
      databaseUri: maskDatabaseUri(uri),
    });
  } catch (err) {
    healthState.setDatabaseConnected(false);
    log('error', 'Services service database connection failed', {
      databaseProvider: DATABASE_PROVIDER,
      error: {
        message: err.message,
        stack: err.stack,
      },
    });
  }

  await nestApp.listen(PORT);
  log('info', 'Services service HTTP server started', {
    port: Number(PORT),
    runtime: 'nestjs',
    service: 'services-service',
  });
};

bootstrap()
  .catch((err) => {
    log('error', 'Services service HTTP server failed to start', {
      error: {
        message: err.message,
        stack: err.stack,
      },
    });
    process.exit(1);
  });
