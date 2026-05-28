const DEFAULT_PUBLIC_PATHS = ['/api/health', '/api/metrics'];

const parseCsv = (value) =>
  String(value || '')
    .split(',')
    .map((item) => item.trim())
    .filter(Boolean);

const getInternalServiceToken = () =>
  (process.env.INTERNAL_SERVICE_TOKEN || '').trim();

const getInternalPublicPaths = () => [
  ...DEFAULT_PUBLIC_PATHS,
  ...parseCsv(process.env.INTERNAL_SERVICE_PUBLIC_PATHS),
];

const getRequestPath = (req) =>
  (req.originalUrl || `${req.baseUrl || ''}${req.path || ''}`).split('?')[0];

const isInternalPublicPath = (path, publicPaths = getInternalPublicPaths()) =>
  publicPaths.some((publicPath) =>
    path === publicPath || path.startsWith(`${publicPath}/`)
  );

const createInternalServiceAuth = ({
  getToken = getInternalServiceToken,
  getPublicPaths = getInternalPublicPaths,
} = {}) => (req, res, next) => {
  const expectedToken = getToken();

  if (!expectedToken) {
    return next();
  }

  const path = getRequestPath(req);
  if (isInternalPublicPath(path, getPublicPaths())) {
    return next();
  }

  const receivedToken = req.get('x-internal-token');
  if (receivedToken === expectedToken) {
    return next();
  }

  return res.status(401).json({
    error: {
      status: 401,
      code: 'INTERNAL_UNAUTHORIZED',
      message: 'Chamada interna não autorizada',
    },
  });
};

module.exports = {
  createInternalServiceAuth,
  getInternalPublicPaths,
  getInternalServiceToken,
  isInternalPublicPath,
};
