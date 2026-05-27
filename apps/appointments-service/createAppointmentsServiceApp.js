require('reflect-metadata');

const express = require('express');
const { NestFactory } = require('@nestjs/core');
const AppointmentsServiceModule = require('./src/app.module');
const {
  securityHeaders,
  cors,
  createRateLimiter,
} = require('../../src/middlewares/security');
const { requestLogger } = require('../../src/middlewares/logger');
const {
  configureTerminalHandlers,
} = require('../../src/configureBaseApp');
const HttpExceptionFilter = require('../../src/nest/common/http-exception.filter');

const configureAppointmentsServiceBaseApp = (app) => {
  app.disable('x-powered-by');
  app.use(securityHeaders);
  app.use(cors);
  app.use(express.json({ limit: '1mb' }));
  app.use(requestLogger);
  app.set('dbConnected', false);
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
