require('reflect-metadata');

const {
  Controller,
  Get,
  Req,
} = require('@nestjs/common');
const { buildHealthResponse } = require('../../health');
const {
  decorateMethod,
  decorateParam,
} = require('../common/decorators');

class HealthController {
  getHealth(req) {
    const dbConnected = req.app.get('dbConnected');
    const response = req.res;

    response.status(dbConnected ? 200 : 503);
    return buildHealthResponse(req, dbConnected);
  }
}

Controller('api')(HealthController);

decorateMethod(HealthController, 'getHealth', [Get('health')]);
decorateParam(HealthController, 'getHealth', 0, Req());

module.exports = HealthController;
