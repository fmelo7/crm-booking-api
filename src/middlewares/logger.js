const crypto = require('crypto');
const { recordHttpRequest } = require('../observability/metrics');

const getServiceName = () =>
  (process.env.SERVICE_NAME || process.env.npm_package_name || 'serv365-api').trim();

const getTraceIdFromTraceparent = (traceparent) => {
  const [, traceId] = String(traceparent || '').split('-');

  if (/^[a-f0-9]{32}$/i.test(traceId || '')) {
    return traceId;
  }

  return null;
};

const getTraceIdFromRequest = (req) =>
  req.get('x-trace-id') ||
  getTraceIdFromTraceparent(req.get('traceparent')) ||
  crypto.randomUUID();

const normalizeTraceIdForTraceparent = (traceId) => {
  const normalized = String(traceId || '').replaceAll('-', '').toLowerCase();

  if (/^[a-f0-9]{32}$/.test(normalized)) {
    return normalized;
  }

  return crypto.createHash('sha256').update(String(traceId || crypto.randomUUID())).digest('hex').slice(0, 32);
};

const createTraceparent = (traceId) =>
  `00-${normalizeTraceIdForTraceparent(traceId)}-${crypto.randomBytes(8).toString('hex')}-01`;

const log = (level, message, metadata = {}) => {
  const { service, ...rest } = metadata;
  const entry = {
    timestamp: new Date().toISOString(),
    level,
    service: service || getServiceName(),
    environment: process.env.NODE_ENV || 'development',
    message,
    ...rest,
  };

  const output = JSON.stringify(entry);

  if (level === 'error') {
    console.error(output);
    return;
  }

  console.log(output);
};

const requestLogger = (req, res, next) => {
  const startedAt = process.hrtime.bigint();
  const requestId = req.get('x-request-id') || crypto.randomUUID();
  const traceId = getTraceIdFromRequest(req);

  req.requestId = requestId;
  req.traceId = traceId;
  res.setHeader('x-request-id', requestId);
  res.setHeader('x-trace-id', traceId);
  res.setHeader('traceparent', req.get('traceparent') || createTraceparent(traceId));

  res.on('finish', () => {
    const durationMs = Number(process.hrtime.bigint() - startedAt) / 1_000_000;
    const status = res.statusCode;
    recordHttpRequest({
      method: req.method,
      route: req.route?.path || req.path || req.originalUrl,
      status,
      durationMs,
    });

    if (process.env.NODE_ENV === 'test') return;

    const level = status >= 500 ? 'error' : status >= 400 ? 'warn' : 'info';

    log(level, 'HTTP request completed', {
      requestId,
      traceId,
      http: {
        method: req.method,
        path: req.originalUrl,
        status,
        durationMs: Number(durationMs.toFixed(2)),
      },
      client: {
        ip: req.ip,
        userAgent: req.get('user-agent'),
      },
    });
  });

  next();
};

module.exports = {
  createTraceparent,
  getServiceName,
  getTraceIdFromRequest,
  getTraceIdFromTraceparent,
  log,
  normalizeTraceIdForTraceparent,
  requestLogger,
};
