const crypto = require('crypto');

const log = (level, message, metadata = {}) => {
  const entry = {
    timestamp: new Date().toISOString(),
    level,
    service: 'serv365-api',
    environment: process.env.NODE_ENV || 'development',
    message,
    ...metadata,
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

  req.requestId = requestId;
  res.setHeader('x-request-id', requestId);

  res.on('finish', () => {
    if (process.env.NODE_ENV === 'test') return;

    const durationMs = Number(process.hrtime.bigint() - startedAt) / 1_000_000;
    const status = res.statusCode;
    const level = status >= 500 ? 'error' : status >= 400 ? 'warn' : 'info';

    log(level, 'HTTP request completed', {
      requestId,
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
  log,
  requestLogger,
};
