const { Injectable } = require('@nestjs/common');

const setParamTypes = (target, paramTypes) => {
  Reflect.defineMetadata('design:paramtypes', paramTypes, target);
};

const defineInjectable = (target, paramTypes) => {
  setParamTypes(target, paramTypes);
  Injectable()(target);

  return target;
};

module.exports = {
  defineInjectable,
  setParamTypes,
};
