require('dotenv').config();

const { getDatabaseProvider } = require('../../packages/shared/common/databaseProvider');
const createProfessionalsServiceApp = require('./createProfessionalsServiceApp');
const { connectDatabase, maskDatabaseUri } = require('../../src/config/database');
const { readServiceDatabaseEnv } = require('../../src/config/serviceDatabase');
const { getMaskedEnv, isEnvDebugEnabled } = require('../../src/config/envDebug');
const { log } = require('../../src/middlewares/logger');

const SERVICE_NAME = 'professionals-service';
process.env.SERVICE_NAME = SERVICE_NAME;
const PORT = process.env.PROFESSIONALS_SERVICE_PORT || process.env.PORT || 3004;
const DATABASE_PROVIDER = getDatabaseProvider();
const SERVICE_DATABASE = readServiceDatabaseEnv(SERVICE_NAME);
const DATABASE_CONNECT_RETRIES = Number(process.env.DATABASE_CONNECT_RETRIES || 10);
const DATABASE_CONNECT_RETRY_MS = Number(process.env.DATABASE_CONNECT_RETRY_MS || 3000);

const wait = (ms) => new Promise((resolve) => setTimeout(resolve, ms));

log('info', 'Professionals service database provider resolved', {
  databaseProvider: DATABASE_PROVIDER,
  databaseDomain: SERVICE_DATABASE.domain,
  hasOwnConnection: DATABASE_PROVIDER === 'postgres'
    ? SERVICE_DATABASE.hasOwnPostgresUri
    : SERVICE_DATABASE.hasOwnMongoUri,
});

if (isEnvDebugEnabled()) {
  log('info', 'Professionals service environment variables loaded', {
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
      log('warn', 'Professionals service database connection attempt failed', {
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
  const { nestApp, expressApp } = await createProfessionalsServiceApp();

  try {
    const uri = await connectDatabaseWithRetry();
    expressApp.set('dbConnected', true);
    log('info', 'Professionals service database connected', {
      databaseProvider: DATABASE_PROVIDER,
      databaseUri: maskDatabaseUri(uri),
    });
  } catch (err) {
    expressApp.set('dbConnected', false);
    log('error', 'Professionals service database connection failed', {
      databaseProvider: DATABASE_PROVIDER,
      error: {
        message: err.message,
        stack: err.stack,
      },
    });
  }

  await nestApp.listen(PORT);
  log('info', 'Professionals service HTTP server started', {
    port: Number(PORT),
    runtime: 'nestjs',
    service: 'professionals-service',
  });
};

bootstrap()
  .catch((err) => {
    log('error', 'Professionals service HTTP server failed to start', {
      error: {
        message: err.message,
        stack: err.stack,
      },
    });
    process.exit(1);
  });
