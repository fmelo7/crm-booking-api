const { healthHandler } = require('./health');
const {
  configureBaseApp,
  configureTerminalHandlers,
} = require('./configureBaseApp');

const appointmentRoutes = require('./modules/appointment/appointment.routes');
const professionalRoutes = require('./modules/professional/professional.routes');
const serviceRoutes = require('./modules/service/service.routes');
const customerRoutes = require('./modules/customer/customer.routes');

const configureLegacyRoutes = (app) => {
  app.get('/api/health', healthHandler);
  app.use('/api/appointments', appointmentRoutes);
  app.use('/api/professionals', professionalRoutes);
  app.use('/api/services', serviceRoutes);
  app.use('/api/customers', customerRoutes);

  return app;
};

const configureLegacyApp = (app) => {
  configureBaseApp(app);
  configureLegacyRoutes(app);
  configureTerminalHandlers(app);

  return app;
};

module.exports = configureLegacyApp;
module.exports.configureBaseApp = configureBaseApp;
module.exports.configureLegacyRoutes = configureLegacyRoutes;
module.exports.configureTerminalHandlers = configureTerminalHandlers;
