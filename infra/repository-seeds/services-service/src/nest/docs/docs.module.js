const DocsController = require('./docs.controller');
const { defineModule } = require('../common/module');

const DocsModule = defineModule({
  controllers: [DocsController],
});

module.exports = DocsModule;
