// configureApp.js

const express = require('express');
const path = require('path');
const swaggerUi = require('swagger-ui-express');
const swaggerSpec = require('./swagger');
const { getDatabaseProvider } = require('./modules/common/databaseProvider');
const { getPostgresUri } = require('./config/postgres');
const { getMaskedEnv, isEnvDebugEnabled, maskValue } = require('./config/envDebug');
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

  app.get('/api/health', (req, res) => {
    const dbConnected = app.get('dbConnected');
    const databaseProvider = getDatabaseProvider();

    res.status(dbConnected ? 200 : 503).json({
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
    });
  });

  app.use('/api', createRateLimiter());

  return app;
};

const configureLegacyRoutes = (app) => {
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
