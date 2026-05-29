const { Module } = require('@nestjs/common');

const defineModule = (metadata) => {
  class NestModule {}

  Module(metadata)(NestModule);

  return NestModule;
};

module.exports = {
  defineModule,
};
