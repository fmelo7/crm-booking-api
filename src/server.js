// src/server.js

require('dotenv').config();

const app = require('./app');
const { connectDatabase, maskDatabaseUri } = require('./config/database');
const { log } = require('./middlewares/logger');

const PORT = process.env.PORT || 3000;
const DATABASE_PROVIDER = process.env.DATABASE_PROVIDER || 'mongodb';

const startServer = () => {
  app.listen(PORT, () => {
    log('info', 'HTTP server started', { port: Number(PORT) });
  });
};

connectDatabase()
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
