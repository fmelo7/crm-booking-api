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

  return sendError(res, err);
};

module.exports = {
  sendError,
  notFound,
  errorHandler,
};
