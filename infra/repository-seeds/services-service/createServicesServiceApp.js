require('reflect-metadata');

const express = require('express');
const { NestFactory } = require('@nestjs/core');
const ServicesServiceModule = require('./src/app.module');
const {
  securityHeaders,
  cors,
  createRateLimiter,
} = require('./src/middlewares/security');
const { requestLogger } = require('./src/middlewares/logger');
const { createInternalServiceAuth } = require('./src/common/internalServiceAuth');
const HttpExceptionFilter = require('./src/nest/common/http-exception.filter');

const configureServicesServiceBaseApp = (nestApp) => {
  nestApp.use(securityHeaders);
  nestApp.use(cors);
  nestApp.use(express.json({ limit: '1mb' }));
  nestApp.use(requestLogger);
  nestApp.use(createInternalServiceAuth());
  nestApp.use('/api', createRateLimiter());

  return nestApp;
};

const createServicesServiceApp = async () => {
  const nestApp = await NestFactory.create(ServicesServiceModule, {
    logger: process.env.NODE_ENV === 'test' ? false : undefined,
  });

  configureServicesServiceBaseApp(nestApp);
  nestApp.useGlobalFilters(new HttpExceptionFilter());
  await nestApp.init();

  return {
    nestApp,
  };
};

module.exports = createServicesServiceApp;
