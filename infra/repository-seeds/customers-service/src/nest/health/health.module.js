const HealthController = require('./health.controller');
const HealthState = require('./health.state');
const { defineModule } = require('../common/module');

const HealthModule = defineModule({
  controllers: [HealthController],
  providers: [HealthState],
  exports: [HealthState],
});

module.exports = HealthModule;
