const express = require('express');
const fs = require('fs');
const path = require('path');
const swaggerUi = require('swagger-ui-express');
const swaggerSpec = require('./swagger');
const { createGatewayContext, gatewayAuth } = require('../apps/api/gateway');
const { securityHeaders, cors, createRateLimiter } = require('./middlewares/security');
const { notFound, errorHandler } = require('./middlewares/error');
const { requestLogger } = require('./middlewares/logger');

const resolveFrontendPublicDir = () => {
  if (process.env.FRONTEND_PUBLIC_DIR) {
    return path.resolve(process.env.FRONTEND_PUBLIC_DIR);
  }

  const appFrontendDir = path.join(__dirname, '../apps/frontend/public');
  if (fs.existsSync(appFrontendDir)) {
    return appFrontendDir;
  }

  return path.join(__dirname, '../public');
};

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
  app.use(createGatewayContext);
  app.set('dbConnected', false);
  app.use(express.static(resolveFrontendPublicDir()));
  app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(swaggerSpec));

  app.use('/api', createRateLimiter());
  app.use('/api', gatewayAuth);

  return app;
};

module.exports = configureBaseApp;
module.exports.configureBaseApp = configureBaseApp;
module.exports.configureTerminalHandlers = configureTerminalHandlers;
