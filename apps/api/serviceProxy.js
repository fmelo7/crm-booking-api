const { log } = require('../../src/middlewares/logger');

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

const getAppointmentsServiceUrl = () =>
  (process.env.APPOINTMENTS_SERVICE_URL || '').trim().replace(/\/$/, '');

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

  if (req.gateway?.auth?.subject) {
    headers['x-authenticated-subject'] = req.gateway.auth.subject;
  }

  return headers;
};

const hasBody = (req) =>
  !['GET', 'HEAD'].includes(req.method) && req.body && Object.keys(req.body).length > 0;

const createAppointmentsServiceProxy = ({
  fetchImpl = (...args) => fetch(...args),
  getTargetUrl = getAppointmentsServiceUrl,
} = {}) => async (req, res, next) => {
  const targetUrl = getTargetUrl();

  if (!targetUrl) {
    return next();
  }

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

    res.setHeader('x-gateway-target', 'appointments-service');

    const body = await upstreamResponse.text();
    return res.send(body);
  } catch (err) {
    if (process.env.NODE_ENV !== 'test') {
      log('error', 'Appointments service proxy failed', {
        requestId: req.requestId,
        gateway: {
          target: 'appointments-service',
          upstreamUrl,
        },
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
        message: 'Serviço de agendamentos indisponível',
      },
    });
  }
};

module.exports = {
  createAppointmentsServiceProxy,
  getAppointmentsServiceUrl,
};
