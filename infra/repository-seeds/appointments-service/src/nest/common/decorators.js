const decorateMethod = (ControllerClass, method, decorators) => {
  const descriptor = Object.getOwnPropertyDescriptor(ControllerClass.prototype, method);

  decorators.forEach((decorator) => {
    decorator(ControllerClass.prototype, method, descriptor);
  });
};

const decorateParam = (ControllerClass, method, index, decorator) => {
  decorator(ControllerClass.prototype, method, index);
};

module.exports = {
  decorateMethod,
  decorateParam,
};
