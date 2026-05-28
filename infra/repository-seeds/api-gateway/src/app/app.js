const express = require('express');
const { createGatewayContext, gatewayAuth } = require('./gateway');
const { createConfiguredServiceProxies } = require('./serviceProxy');
const { buildHealthResponse } = require('../health');
const { requestLogger } = require('../middlewares/logger');
const { cors, createRateLimiter, securityHeaders } = require('../middlewares/security');
const { errorHandler, notFound } = require('../middlewares/error');
const { metricsHandler } = require('../observability/metrics');

const createApiGatewayApp = () => {
  const app = express();

  app.disable('x-powered-by');
  app.use(securityHeaders);
  app.use(cors);
  app.use(express.json({ limit: '1mb' }));
  app.use(requestLogger);
  app.use(createGatewayContext);
  app.set('dbConnected', true);

  app.get('/api/health', (req, res) => {
    res.status(200).json(buildHealthResponse(req, app.get('dbConnected')));
  });
  app.get('/api/metrics', metricsHandler);

  app.use('/api', createRateLimiter());
  app.use('/api', gatewayAuth);
  createConfiguredServiceProxies().forEach(({ routePrefix, proxy }) => {
    app.use(routePrefix, proxy);
  });

  app.use(notFound);
  app.use(errorHandler);

  return app;
};

module.exports = createApiGatewayApp;
