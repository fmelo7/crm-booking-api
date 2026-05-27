const { log } = require('../../src/middlewares/logger');

const DEFAULT_PUBLIC_PATHS = [
  '/',
  '/api/health',
  '/api-docs',
];

const parseCsv = (value) =>
  String(value || '')
    .split(',')
    .map((item) => item.trim())
    .filter(Boolean);

const getGatewayAuthMode = () =>
  (process.env.GATEWAY_AUTH_MODE || 'disabled').trim().toLowerCase();

const getPublicPaths = () => [
  ...DEFAULT_PUBLIC_PATHS,
  ...parseCsv(process.env.GATEWAY_PUBLIC_PATHS),
];

const isPublicPath = (path, publicPaths = getPublicPaths()) =>
  publicPaths.some((publicPath) =>
    path === publicPath || path.startsWith(`${publicPath}/`)
  );

const getBearerToken = (req) => {
  const authorization = req.get('authorization') || '';
  const [scheme, token] = authorization.split(/\s+/);

  if (scheme?.toLowerCase() !== 'bearer' || !token) {
    return null;
  }

  return token;
};

const getRequestPath = (req) =>
  (req.originalUrl || `${req.baseUrl || ''}${req.path || ''}`).split('?')[0];

const getAllowedBearerTokens = () =>
  new Set(parseCsv(process.env.GATEWAY_BEARER_TOKENS));

const createGatewayContext = (req, res, next) => {
  const path = getRequestPath(req);

  req.gateway = {
    auth: {
      authenticated: false,
      mode: getGatewayAuthMode(),
      subject: null,
      scopes: [],
    },
    route: {
      public: isPublicPath(path),
      target: path.startsWith('/api') ? 'api' : 'frontend',
    },
  };

  res.setHeader('x-gateway-runtime', 'api');

  return next();
};

const gatewayAuth = (req, res, next) => {
  const mode = getGatewayAuthMode();
  const path = getRequestPath(req);
  const isApiRoute = path.startsWith('/api');

  req.gateway.auth.mode = mode;

  if (mode === 'disabled' || !isApiRoute || req.gateway.route.public) {
    return next();
  }

  if (mode !== 'bearer') {
    return res.status(500).json({
      error: {
        status: 500,
        code: 'GATEWAY_AUTH_CONFIG_ERROR',
        message: 'Modo de autenticação do gateway inválido',
      },
    });
  }

  const token = getBearerToken(req);
  const allowedTokens = getAllowedBearerTokens();
  const authenticated = Boolean(token && allowedTokens.has(token));

  if (!authenticated) {
    if (process.env.NODE_ENV !== 'test') {
      log('warn', 'Gateway request rejected', {
        requestId: req.requestId,
        gateway: {
          authMode: mode,
          reason: token ? 'invalid_token' : 'missing_token',
        },
        http: {
          method: req.method,
          path: req.originalUrl,
          status: 401,
        },
      });
    }

    return res.status(401).json({
      error: {
        status: 401,
        code: 'UNAUTHORIZED',
        message: 'Token de autenticação ausente ou inválido',
      },
    });
  }

  req.gateway.auth.authenticated = true;
  req.gateway.auth.subject = 'bearer';
  res.setHeader('x-authenticated-subject', req.gateway.auth.subject);

  return next();
};

module.exports = {
  createGatewayContext,
  gatewayAuth,
  getRequestPath,
  isPublicPath,
};
