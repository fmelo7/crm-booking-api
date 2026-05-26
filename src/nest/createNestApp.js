require('reflect-metadata');

const { NestFactory } = require('@nestjs/core');
const AppModule = require('./app.module');
const configureApp = require('../configureApp');
const { configureTerminalHandlers } = require('../configureApp');
const HttpExceptionFilter = require('./common/http-exception.filter');

const createNestApp = async () => {
  const nestApp = await NestFactory.create(AppModule, {
    logger: process.env.NODE_ENV === 'test' ? false : undefined,
  });
  const expressApp = nestApp.getHttpAdapter().getInstance();

  configureApp(expressApp, {
    includeTerminalHandlers: false,
    legacyModules: {
      customers: false,
      professionals: false,
      services: false,
    },
  });
  nestApp.useGlobalFilters(new HttpExceptionFilter());
  await nestApp.init();
  configureTerminalHandlers(expressApp);

  return {
    nestApp,
    expressApp,
  };
};

module.exports = createNestApp;
