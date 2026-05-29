const { Catch } = require('@nestjs/common');
const { log } = require('../../middlewares/logger');
const { sendError } = require('../../middlewares/error');

const getExceptionStatus = (exception, payload) => {
  if (typeof exception.getStatus === 'function') {
    return exception.getStatus();
  }

  return exception.status || payload?.status || payload?.statusCode || 500;
};

const getExceptionCode = (status, payload, exception) => {
  if (payload?.code || exception.code) {
    return payload?.code || exception.code;
  }

  return status === 404 ? 'NOT_FOUND' : undefined;
};

const getExceptionMessage = (status, payload, exception) => {
  if (status === 404 && !payload?.code) {
    return 'Rota não encontrada';
  }

  return payload?.message || exception.message;
};

class HttpExceptionFilter {
  catch(exception, host) {
    const request = host.switchToHttp().getRequest();
    const response = host.switchToHttp().getResponse();
    const payload = typeof exception.getResponse === 'function'
      ? exception.getResponse()
      : exception;
    const status = getExceptionStatus(exception, payload);

    if (status >= 500 && process.env.NODE_ENV !== 'test') {
      log('error', exception.message || 'Erro interno', {
        requestId: request?.requestId,
        traceId: request?.traceId,
        error: {
          message: exception.message,
          stack: exception.stack,
        },
        http: {
          method: request?.method,
          path: request?.originalUrl,
          status,
        },
      });
    }

    return sendError(response, {
      status,
      code: getExceptionCode(status, payload, exception),
      message: getExceptionMessage(status, payload, exception),
      details: payload?.details || exception.details,
      stack: exception.stack,
    });
  }
}

Catch()(HttpExceptionFilter);

module.exports = HttpExceptionFilter;
