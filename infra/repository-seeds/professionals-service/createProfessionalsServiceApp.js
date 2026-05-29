require('reflect-metadata');

const express = require('express');
const { NestFactory } = require('@nestjs/core');
const ProfessionalsServiceModule = require('./src/app.module');
const {
  securityHeaders,
  cors,
  createRateLimiter,
} = require('./src/middlewares/security');
const { requestLogger } = require('./src/middlewares/logger');
const { createInternalServiceAuth } = require('./src/common/internalServiceAuth');
const HttpExceptionFilter = require('./src/nest/common/http-exception.filter');

const configureProfessionalsServiceBaseApp = (nestApp) => {
  nestApp.use(securityHeaders);
  nestApp.use(cors);
  nestApp.use(express.json({ limit: '1mb' }));
  nestApp.use(requestLogger);
  nestApp.use(createInternalServiceAuth());
  nestApp.use('/api', createRateLimiter());

  return nestApp;
};

const createProfessionalsServiceApp = async () => {
  const nestApp = await NestFactory.create(ProfessionalsServiceModule, {
    logger: process.env.NODE_ENV === 'test' ? false : undefined,
  });

  configureProfessionalsServiceBaseApp(nestApp);
  nestApp.useGlobalFilters(new HttpExceptionFilter());
  await nestApp.init();

  return {
    nestApp,
  };
};

module.exports = createProfessionalsServiceApp;
module.exports.configureProfessionalsServiceBaseApp = configureProfessionalsServiceBaseApp;
