const MetricsController = require('./metrics.controller');
const { defineModule } = require('../common/module');

const MetricsModule = defineModule({
  controllers: [MetricsController],
});

module.exports = MetricsModule;
