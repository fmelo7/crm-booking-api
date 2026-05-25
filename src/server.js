// src/server.js

require('dotenv').config();

const { getDatabaseProvider } = require('./modules/common/databaseProvider');
const app = require('./app');
const { connectDatabase, maskDatabaseUri } = require('./config/database');
const { log } = require('./middlewares/logger');

const PORT = process.env.PORT || 3000;
const DATABASE_PROVIDER = getDatabaseProvider();
const DATABASE_CONNECT_RETRIES = Number(process.env.DATABASE_CONNECT_RETRIES || 10);
const DATABASE_CONNECT_RETRY_MS = Number(process.env.DATABASE_CONNECT_RETRY_MS || 3000);

const wait = (ms) => new Promise((resolve) => setTimeout(resolve, ms));

const startServer = () => {
  app.listen(PORT, () => {
    log('info', 'HTTP server started', { port: Number(PORT) });
  });
};

log('info', 'Database provider resolved', {
  databaseProvider: DATABASE_PROVIDER,
  hasDatabaseUrl: Boolean(process.env.DATABASE_URL),
  hasPostgresUri: Boolean(process.env.POSTGRES_URI),
  hasMongoUri: Boolean(process.env.MONGODB_URI),
});

const connectDatabaseWithRetry = async () => {
  let lastError;

  for (let attempt = 1; attempt <= DATABASE_CONNECT_RETRIES; attempt += 1) {
    try {
      return await connectDatabase();
    } catch (err) {
      lastError = err;
      log('warn', 'Database connection attempt failed', {
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

connectDatabaseWithRetry()
  .then((uri) => {
    app.set('dbConnected', true);
    log('info', 'Database connected', {
      databaseProvider: DATABASE_PROVIDER,
      databaseUri: maskDatabaseUri(uri),
    });
  })
  .catch((err) => {
    app.set('dbConnected', false);
    log('error', 'Database connection failed', {
      databaseProvider: DATABASE_PROVIDER,
      error: {
        message: err.message,
        stack: err.stack,
      },
    });
  })
  .finally(() => {
    startServer();
  });
