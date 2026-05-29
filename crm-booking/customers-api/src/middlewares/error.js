const sendError = (res, err) => {
  const status = err.status || err.statusCode || 500;
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

module.exports = {
  sendError,
};
