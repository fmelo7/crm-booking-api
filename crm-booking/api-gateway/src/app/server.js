require('dotenv').config();

const createApiGatewayApp = require('./app');
const { log } = require('../middlewares/logger');

const PORT = Number(process.env.PORT || 3000);

const app = createApiGatewayApp();

app.listen(PORT, () => {
  log('info', 'API gateway HTTP server started', {
    port: PORT,
    runtime: 'express',
    service: 'api-gateway',
  });
});
