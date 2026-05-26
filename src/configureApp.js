// configureApp.js

const express = require('express');
const path = require('path');
const swaggerUi = require('swagger-ui-express');
const swaggerSpec = require('./swagger');
const { healthHandler } = require('./health');
const { securityHeaders, cors, createRateLimiter } = require('./middlewares/security');
const { notFound, errorHandler } = require('./middlewares/error');
const { requestLogger } = require('./middlewares/logger');

const appointmentRoutes = require('./modules/appointment/appointment.routes');
const professionalRoutes = require('./modules/professional/professional.routes');
const serviceRoutes = require('./modules/service/service.routes');
const customerRoutes = require('./modules/customer/customer.routes');

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

const configureLegacyRoutes = (app) => {
  app.get('/api/health', healthHandler);
  app.use('/api/appointments', appointmentRoutes);
  app.use('/api/professionals', professionalRoutes);
  app.use('/api/services', serviceRoutes);
  app.use('/api/customers', customerRoutes);

  return app;
};

const configureApp = (app) => {
  configureBaseApp(app);
  configureLegacyRoutes(app);
  configureTerminalHandlers(app);

  return app;
};

module.exports = configureApp;
module.exports.configureBaseApp = configureBaseApp;
module.exports.configureLegacyRoutes = configureLegacyRoutes;
module.exports.configureTerminalHandlers = configureTerminalHandlers;
