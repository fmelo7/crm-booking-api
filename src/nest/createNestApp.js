require('reflect-metadata');

const { NestFactory } = require('@nestjs/core');
const AppModule = require('./app.module');
const configureApp = require('../configureApp');

const createNestApp = async () => {
  const nestApp = await NestFactory.create(AppModule);
  const expressApp = nestApp.getHttpAdapter().getInstance();

  configureApp(expressApp);

  return {
    nestApp,
    expressApp,
  };
};

module.exports = createNestApp;
