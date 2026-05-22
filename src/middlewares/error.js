const sendError = (res, err) => {
  const status = err.status || 500;
  const message = status >= 500 ? 'Erro interno do servidor' : err.message;

  return res.status(status).json({ message });
};

const notFound = (req, res) =>
  res.status(404).json({ message: 'Rota não encontrada' });

const errorHandler = (err, req, res, next) => {
  if (res.headersSent) {
    return next(err);
  }

  const log = {
    timestamp: new Date().toISOString(),
    level: 'error',
    service: 'serv365-api',
    environment: process.env.NODE_ENV || 'development',

    message: err.message || 'Erro interno',

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

  console.error(JSON.stringify(log));

  return sendError(res, err);
};

module.exports = {
  sendError,
  notFound,
  errorHandler,
};
