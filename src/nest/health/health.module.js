const HealthController = require('./health.controller');
const { defineModule } = require('../common/module');

const HealthModule = defineModule({
  controllers: [HealthController],
});

module.exports = HealthModule;
