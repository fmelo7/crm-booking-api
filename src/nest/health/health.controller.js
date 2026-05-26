require('reflect-metadata');

const {
  Controller,
  Get,
  Req,
} = require('@nestjs/common');
const { buildHealthResponse } = require('../../health');

class HealthController {
  getHealth(req) {
    const dbConnected = req.app.get('dbConnected');
    const response = req.res;

    response.status(dbConnected ? 200 : 503);
    return buildHealthResponse(req, dbConnected);
  }
}

Controller('api')(HealthController);

Get('health')(HealthController.prototype, 'getHealth', Object.getOwnPropertyDescriptor(HealthController.prototype, 'getHealth'));
Req()(HealthController.prototype, 'getHealth', 0);

module.exports = HealthController;
