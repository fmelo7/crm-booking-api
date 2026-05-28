const { Catch } = require('@nestjs/common');
const { sendError } = require('../../middlewares/error');

class HttpExceptionFilter {
  catch(exception, host) {
    const response = host.switchToHttp().getResponse();
    const status = typeof exception.getStatus === 'function'
      ? exception.getStatus()
      : exception.status;

    const payload = typeof exception.getResponse === 'function'
      ? exception.getResponse()
      : exception;

    return sendError(response, {
      status,
      code: payload?.code || exception.code,
      message: payload?.message || exception.message,
      details: payload?.details || exception.details,
      stack: exception.stack,
    });
  }
}

Catch()(HttpExceptionFilter);

module.exports = HttpExceptionFilter;
