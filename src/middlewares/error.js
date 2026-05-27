const { log } = require('./logger');

const sendError = (res, err) => {
  const status = err.status || 500;
  const message = status >= 500 ? 'Erro interno do servidor' : err.message;

  return res.status(status).json({
    error: {
      status,
      code: err.code || (status >= 500 ? 'INTERNAL_ERROR' : 'REQUEST_ERROR'),
      message,
      details: status >= 500 ? undefined : err.details,
    }
  });
};

const notFound = (req, res) =>
  sendError(res, { status: 404, code: 'NOT_FOUND', message: 'Rota não encontrada' });

const errorHandler = (err, req, res, next) => {
  if (res.headersSent) {
    return next(err);
  }

  const metadata = {
    requestId: req.requestId,
    traceId: req.traceId,

    error: {
      message: err.message,
      stack: err.stack
    },

    http: {
      method: req.method,
      path: req.originalUrl,
      status: err.status || 500
    },

    request: {
      body: req.body,
      query: req.query,
      params: req.params
    }
  };

  if (process.env.NODE_ENV !== 'test') {
    log('error', err.message || 'Erro interno', metadata);
  }

  return sendError(res, err);
};

module.exports = {
  sendError,
  notFound,
  errorHandler,
};
