const { Injectable } = require('@nestjs/common');

const createRepositoryProvider = (repository, methods) => {
  class RepositoryProvider {}

  methods.forEach((method) => {
    RepositoryProvider.prototype[method] = function (...args) {
      return repository[method](...args);
    };
  });

  Injectable()(RepositoryProvider);

  return RepositoryProvider;
};

module.exports = {
  createRepositoryProvider,
};
