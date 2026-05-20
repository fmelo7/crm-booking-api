// app.js

const express = require('express');
const swaggerUi = require('swagger-ui-express');
const app = express();

const swaggerSpec = {
  openapi: '3.0.0',
  info: {
    title: 'CRM Booking API',
    version: '1.0.0',
    description: 'API de agendamento CRM com Express e MongoDB',
  },
  servers: [
    {
      url: process.env.SWAGGER_SERVER_URL || 'http://localhost:3000',
      description: 'Servidor da API',
    },
  ],
  paths: {
    '/api/health': {
      get: {
        summary: 'Verificar saúde da API',
        responses: {
          '200': {
            description: 'Status da API',
            content: {
              'application/json': {
                schema: {
                  type: 'object',
                  properties: {
                    status: { type: 'string' },
                    dbConnected: { type: 'boolean' },
                    uptime: { type: 'number' },
                    timestamp: { type: 'string' },
                  },
                },
              },
            },
          },
        },
      },
    },
  },
};

app.use(express.json());
app.set('dbConnected', false);
app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(swaggerSpec));

app.get('/api/health', (req, res) => {
  res.status(200).json({
    status: 'ok',
    dbConnected: app.get('dbConnected'),
    uptime: process.uptime(),
    timestamp: new Date().toISOString(),
  });
});

const appointmentRoutes = require('./modules/appointment/appointment.routes');
const professionalRoutes = require('./modules/professional/professional.routes');
const serviceRoutes = require('./modules/service/service.routes');
const customerRoutes = require('./modules/customer/customer.routes');

app.use('/api/appointments', appointmentRoutes);
app.use('/api/professionals', professionalRoutes);
app.use('/api/services', serviceRoutes);
app.use('/api/customers', customerRoutes);

module.exports = app;