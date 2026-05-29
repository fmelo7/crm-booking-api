require('reflect-metadata');

const {
  Controller,
  Get,
  Req,
} = require('@nestjs/common');
const { buildHealthResponse } = require('../../health');
const HealthState = require('./health.state');
const {
  decorateMethod,
  decorateParam,
} = require('../common/decorators');
const { setParamTypes } = require('../common/injection');

class HealthController {
  constructor(healthState) {
    this.healthState = healthState;
  }

  getHealth(req) {
    const dbConnected = this.healthState.isDatabaseConnected();
    const response = req.res;

    response.status(dbConnected ? 200 : 503);
    return buildHealthResponse(req, dbConnected);
  }
}

setParamTypes(HealthController, [HealthState]);

Controller('api')(HealthController);

decorateMethod(HealthController, 'getHealth', [Get('health')]);
decorateParam(HealthController, 'getHealth', 0, Req());

module.exports = HealthController;
