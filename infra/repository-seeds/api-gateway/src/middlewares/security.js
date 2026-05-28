const parseAllowedOrigins = () =>
  (process.env.CORS_ORIGINS || '')
    .split(',')
    .map((origin) => origin.trim())
    .filter(Boolean);

const securityHeaders = (req, res, next) => {
  res.setHeader('X-Content-Type-Options', 'nosniff');
  res.setHeader('X-Frame-Options', 'DENY');
  res.setHeader('Referrer-Policy', 'no-referrer');
  next();
};

const cors = (req, res, next) => {
  const origin = req.headers.origin;
  const allowedOrigins = parseAllowedOrigins();

  if (origin && (allowedOrigins.includes('*') || allowedOrigins.includes(origin))) {
    res.setHeader('Access-Control-Allow-Origin', origin);
    res.setHeader('Vary', 'Origin');
    res.setHeader('Access-Control-Allow-Methods', 'GET,POST,PUT,DELETE,OPTIONS');
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type,Authorization');
  }

  if (req.method === 'OPTIONS') {
    return res.sendStatus(204);
  }

  return next();
};

const createRateLimiter = ({
  windowMs = Number(process.env.RATE_LIMIT_WINDOW_MS) || 15 * 60 * 1000,
  max = Number(process.env.RATE_LIMIT_MAX) || 300,
} = {}) => {
  const hits = new Map();

  return (req, res, next) => {
    const now = Date.now();
    const key = req.ip || req.socket.remoteAddress || 'unknown';
    const current = hits.get(key);

    if (!current || current.resetAt <= now) {
      hits.set(key, { count: 1, resetAt: now + windowMs });
      return next();
    }

    current.count += 1;

    if (current.count > max) {
      res.setHeader('Retry-After', Math.ceil((current.resetAt - now) / 1000));
      return res.status(429).json({ message: 'Muitas requisições. Tente novamente em instantes.' });
    }

    return next();
  };
};

module.exports = {
  securityHeaders,
  cors,
  createRateLimiter,
};
