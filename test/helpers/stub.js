const createStub = (implementation = () => undefined) => {
  const calls = [];

  const stub = (...args) => {
    calls.push(args);
    return implementation(...args);
  };

  stub.calls = calls;

  return stub;
};

module.exports = createStub;
