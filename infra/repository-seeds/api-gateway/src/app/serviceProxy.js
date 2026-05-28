const { log } = require('../middlewares/logger');

const hopByHopHeaders = new Set([
  'connection',
  'content-length',
  'host',
  'keep-alive',
  'proxy-authenticate',
  'proxy-authorization',
  'te',
  'trailer',
  'transfer-encoding',
  'upgrade',
]);

const SERVICE_PROXY_CONFIGS = {
  appointments: {
    routePrefix: '/api/appointments',
    targetName: 'appointments-service',
    urlEnv: 'APPOINTMENTS_SERVICE_URL',
    tokenEnv: 'APPOINTMENTS_SERVICE_INTERNAL_TOKEN',
    unavailableMessage: 'Serviço de agendamentos indisponível',
  },
  customers: {
    routePrefix: '/api/customers',
    targetName: 'customers-service',
    urlEnv: 'CUSTOMERS_SERVICE_URL',
    tokenEnv: 'CUSTOMERS_SERVICE_INTERNAL_TOKEN',
    unavailableMessage: 'Serviço de clientes indisponível',
  },
  services: {
    routePrefix: '/api/services',
    targetName: 'services-service',
    urlEnv: 'SERVICES_SERVICE_URL',
    tokenEnv: 'SERVICES_SERVICE_INTERNAL_TOKEN',
    unavailableMessage: 'Serviço de serviços indisponível',
  },
  professionals: {
    routePrefix: '/api/professionals',
    targetName: 'professionals-service',
    urlEnv: 'PROFESSIONALS_SERVICE_URL',
    tokenEnv: 'PROFESSIONALS_SERVICE_INTERNAL_TOKEN',
    unavailableMessage: 'Serviço de profissionais indisponível',
  },
};

const normalizeUrl = (value) => (value || '').trim().replace(/\/$/, '');

const getServiceUrl = (serviceKey) =>
  normalizeUrl(process.env[SERVICE_PROXY_CONFIGS[serviceKey]?.urlEnv]);

const getAppointmentsServiceUrl = () => getServiceUrl('appointments');

const getInternalServiceToken = (serviceKey = 'appointments') => {
  const tokenEnv = SERVICE_PROXY_CONFIGS[serviceKey]?.tokenEnv;
  return (process.env[tokenEnv] || process.env.INTERNAL_SERVICE_TOKEN || '').trim();
};

const buildHeaders = (req) => {
  const headers = {};

  Object.entries(req.headers).forEach(([key, value]) => {
    if (!hopByHopHeaders.has(key.toLowerCase()) && value !== undefined) {
      headers[key] = value;
    }
  });

  headers['x-forwarded-host'] = req.get('host') || '';
  headers['x-forwarded-proto'] = req.protocol;
  headers['x-request-id'] = req.requestId;
  headers['x-trace-id'] = req.traceId;

  const traceparent = req.get('traceparent');
  if (traceparent) {
    headers.traceparent = traceparent;
  }

  if (req.gateway?.auth?.subject) {
    headers['x-authenticated-subject'] = req.gateway.auth.subject;
  }

  const internalToken = getInternalServiceToken(req.gateway?.route?.serviceKey);
  if (internalToken) {
    headers['x-internal-token'] = internalToken;
  }

  return headers;
};

const hasBody = (req) =>
  !['GET', 'HEAD'].includes(req.method) && req.body && Object.keys(req.body).length > 0;

const createServiceProxy = (serviceKey, {
  fetchImpl = (...args) => fetch(...args),
  getTargetUrl = () => getServiceUrl(serviceKey),
} = {}) => async (req, res, next) => {
  const config = SERVICE_PROXY_CONFIGS[serviceKey];
  const targetUrl = getTargetUrl();

  if (!targetUrl) {
    return next();
  }

  req.gateway.route.serviceKey = serviceKey;
  req.gateway.route.target = config.targetName;

  const upstreamUrl = `${targetUrl}${req.originalUrl}`;

  try {
    const upstreamResponse = await fetchImpl(upstreamUrl, {
      method: req.method,
      headers: buildHeaders(req),
      body: hasBody(req) ? JSON.stringify(req.body) : undefined,
    });

    res.status(upstreamResponse.status);
    upstreamResponse.headers.forEach((value, key) => {
      if (!hopByHopHeaders.has(key.toLowerCase())) {
        res.setHeader(key, value);
      }
    });

    res.setHeader('x-gateway-target', config.targetName);

    const body = await upstreamResponse.text();
    return res.send(body);
  } catch (err) {
    if (process.env.NODE_ENV !== 'test') {
      log('error', 'Appointments service proxy failed', {
        requestId: req.requestId,
        traceId: req.traceId,
        gateway: { target: config.targetName, upstreamUrl },
        error: {
          message: err.message,
          stack: err.stack,
        },
      });
    }

    return res.status(502).json({
      error: {
        status: 502,
        code: 'UPSTREAM_UNAVAILABLE',
        message: config.unavailableMessage,
      },
    });
  }
};

const createAppointmentsServiceProxy = (options) => createServiceProxy('appointments', options);

const createConfiguredServiceProxies = () => Object.entries(SERVICE_PROXY_CONFIGS)
  .map(([serviceKey, config]) => ({
    routePrefix: config.routePrefix,
    proxy: createServiceProxy(serviceKey),
  }));

module.exports = {
  createConfiguredServiceProxies,
  createAppointmentsServiceProxy,
  createServiceProxy,
  getAppointmentsServiceUrl,
  getInternalServiceToken,
  getServiceUrl,
  SERVICE_PROXY_CONFIGS,
};
