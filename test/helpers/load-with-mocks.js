const loadWithMocks = (modulePath, mocks) => {
  const resolvedModulePath = require.resolve(modulePath);
  const resolvedMocks = Object.fromEntries(
    Object.entries(mocks).map(([mockPath, exports]) => [require.resolve(mockPath), exports])
  );

  delete require.cache[resolvedModulePath];

  Object.entries(resolvedMocks).forEach(([mockPath, exports]) => {
    delete require.cache[mockPath];
    require.cache[mockPath] = {
      id: mockPath,
      filename: mockPath,
      loaded: true,
      exports,
    };
  });

  return require(resolvedModulePath);
};

module.exports = loadWithMocks;
