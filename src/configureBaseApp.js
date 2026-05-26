const express = require('express');
const path = require('path');
const swaggerUi = require('swagger-ui-express');
const swaggerSpec = require('./swagger');
const { securityHeaders, cors, createRateLimiter } = require('./middlewares/security');
const { notFound, errorHandler } = require('./middlewares/error');
const { requestLogger } = require('./middlewares/logger');

const configureTerminalHandlers = (app) => {
  app.use(notFound);
  app.use(errorHandler);

  return app;
};

const configureBaseApp = (app) => {
  app.disable('x-powered-by');
  app.use(securityHeaders);
  app.use(cors);
  app.use(express.json({ limit: '1mb' }));
  app.use(requestLogger);
  app.set('dbConnected', false);
  app.use(express.static(path.join(__dirname, '../public')));
  app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(swaggerSpec));

  app.use('/api', createRateLimiter());

  return app;
};

module.exports = configureBaseApp;
module.exports.configureBaseApp = configureBaseApp;
module.exports.configureTerminalHandlers = configureTerminalHandlers;
