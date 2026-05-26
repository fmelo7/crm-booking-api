require('reflect-metadata');

const { Module } = require('@nestjs/common');

class AppModule {}

Module({})(AppModule);

module.exports = AppModule;
