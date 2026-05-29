require('reflect-metadata');

const {
  Controller,
  Get,
  Res,
} = require('@nestjs/common');
const { renderMetrics } = require('../../observability/metrics');
const {
  decorateMethod,
  decorateParam,
} = require('../common/decorators');

class MetricsController {
  getMetrics(res) {
    res.type('text/plain; version=0.0.4; charset=utf-8');
    return res.send(renderMetrics());
  }
}

Controller('api')(MetricsController);

decorateMethod(MetricsController, 'getMetrics', [Get('metrics')]);
decorateParam(MetricsController, 'getMetrics', 0, Res());

module.exports = MetricsController;
