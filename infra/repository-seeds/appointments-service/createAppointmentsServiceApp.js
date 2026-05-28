require('reflect-metadata');

const express = require('express');
const { NestFactory } = require('@nestjs/core');
const AppointmentsServiceModule = require('./src/app.module');
const {
  securityHeaders,
  cors,
  createRateLimiter,
} = require('./src/middlewares/security');
const { requestLogger } = require('./src/middlewares/logger');
const { metricsHandler } = require('./src/observability/metrics');
const { createInternalServiceAuth } = require('./src/common/internalServiceAuth');
const { notFound, errorHandler } = require('./src/middlewares/error');
const HttpExceptionFilter = require('./src/nest/common/http-exception.filter');

const configureTerminalHandlers = (app) => {
  app.use(notFound);
  app.use(errorHandler);

  return app;
};

const configureAppointmentsServiceBaseApp = (app) => {
  app.disable('x-powered-by');
  app.use(securityHeaders);
  app.use(cors);
  app.use(express.json({ limit: '1mb' }));
  app.use(requestLogger);
  app.use(createInternalServiceAuth());
  app.set('dbConnected', false);
  app.get('/api/metrics', metricsHandler);
  app.use('/api', createRateLimiter());

  return app;
};

const createAppointmentsServiceApp = async () => {
  const nestApp = await NestFactory.create(AppointmentsServiceModule, {
    logger: process.env.NODE_ENV === 'test' ? false : undefined,
  });
  const expressApp = nestApp.getHttpAdapter().getInstance();

  configureAppointmentsServiceBaseApp(expressApp);
  nestApp.useGlobalFilters(new HttpExceptionFilter());
  await nestApp.init();
  configureTerminalHandlers(expressApp);

  return {
    nestApp,
    expressApp,
  };
};

module.exports = createAppointmentsServiceApp;
module.exports.configureAppointmentsServiceBaseApp = configureAppointmentsServiceBaseApp;
