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
  tags: [
    { name: 'Health' },
    { name: 'Appointments' },
    { name: 'Professionals' },
    { name: 'Services' },
    { name: 'Customers' },
  ],
  components: {
    parameters: {
      IdParam: {
        name: 'id',
        in: 'path',
        required: true,
        schema: { type: 'string' },
        description: 'ID do registro no MongoDB',
      },
    },
    schemas: {
      Error: {
        type: 'object',
        properties: {
          message: { type: 'string' },
        },
      },
      Health: {
        type: 'object',
        properties: {
          status: { type: 'string', example: 'ok' },
          dbConnected: { type: 'boolean' },
          uptime: { type: 'number' },
          timestamp: { type: 'string', format: 'date-time' },
        },
      },
      CustomerInput: {
        type: 'object',
        required: ['name'],
        properties: {
          name: { type: 'string', example: 'Maria Silva' },
          phone: { type: 'string', example: '+55 11 99999-9999' },
          email: { type: 'string', format: 'email', example: 'maria@example.com' },
          notes: { type: 'string', example: 'Prefere contato por WhatsApp' },
        },
      },
      Customer: {
        allOf: [
          { $ref: '#/components/schemas/CustomerInput' },
          {
            type: 'object',
            properties: {
              _id: { type: 'string' },
              createdAt: { type: 'string', format: 'date-time' },
              updatedAt: { type: 'string', format: 'date-time' },
            },
          },
        ],
      },
      ServiceInput: {
        type: 'object',
        required: ['name'],
        properties: {
          name: { type: 'string', example: 'Corte de cabelo' },
          description: { type: 'string', example: 'Corte masculino ou feminino' },
          durationMinutes: { type: 'number', example: 60 },
          price: { type: 'number', example: 120 },
        },
      },
      Service: {
        allOf: [
          { $ref: '#/components/schemas/ServiceInput' },
          {
            type: 'object',
            properties: {
              _id: { type: 'string' },
              createdAt: { type: 'string', format: 'date-time' },
              updatedAt: { type: 'string', format: 'date-time' },
            },
          },
        ],
      },
      ProfessionalInput: {
        type: 'object',
        required: ['name', 'category'],
        properties: {
          name: { type: 'string', example: 'Ana Souza' },
          category: { type: 'string', example: 'Cabeleireira' },
          phone: { type: 'string', example: '+55 11 98888-8888' },
          email: { type: 'string', format: 'email', example: 'ana@example.com' },
          active: { type: 'boolean', example: true },
        },
      },
      Professional: {
        allOf: [
          { $ref: '#/components/schemas/ProfessionalInput' },
          {
            type: 'object',
            properties: {
              _id: { type: 'string' },
              createdAt: { type: 'string', format: 'date-time' },
              updatedAt: { type: 'string', format: 'date-time' },
            },
          },
        ],
      },
      AppointmentInput: {
        type: 'object',
        required: ['customer', 'service', 'professional', 'startAt', 'endAt'],
        properties: {
          customer: { type: 'string', example: '665f1d6f7c2a8e0012345671' },
          service: { type: 'string', example: '665f1d6f7c2a8e0012345672' },
          professional: { type: 'string', example: '665f1d6f7c2a8e0012345673' },
          startAt: { type: 'string', format: 'date-time', example: '2026-05-21T14:00:00.000Z' },
          endAt: { type: 'string', format: 'date-time', example: '2026-05-21T15:00:00.000Z' },
          notes: { type: 'string', example: 'Cliente pediu encaixe' },
        },
      },
      Appointment: {
        allOf: [
          { $ref: '#/components/schemas/AppointmentInput' },
          {
            type: 'object',
            properties: {
              _id: { type: 'string' },
              createdAt: { type: 'string', format: 'date-time' },
              updatedAt: { type: 'string', format: 'date-time' },
            },
          },
        ],
      },
    },
  },
  paths: {
    '/api/health': {
      get: {
        tags: ['Health'],
        summary: 'Verificar saúde da API',
        responses: {
          '200': {
            description: 'Status da API',
            content: {
              'application/json': {
                schema: { $ref: '#/components/schemas/Health' },
              },
            },
          },
        },
      },
    },
    '/api/appointments': {
      get: {
        tags: ['Appointments'],
        summary: 'Listar agendamentos',
        responses: {
          '200': {
            description: 'Lista de agendamentos',
            content: {
              'application/json': {
                schema: {
                  type: 'array',
                  items: { $ref: '#/components/schemas/Appointment' },
                },
              },
            },
          },
        },
      },
      post: {
        tags: ['Appointments'],
        summary: 'Criar agendamento',
        requestBody: {
          required: true,
          content: {
            'application/json': {
              schema: { $ref: '#/components/schemas/AppointmentInput' },
            },
          },
        },
        responses: {
          '201': {
            description: 'Agendamento criado',
            content: {
              'application/json': {
                schema: { $ref: '#/components/schemas/Appointment' },
              },
            },
          },
          '400': {
            description: 'Dados inválidos',
            content: {
              'application/json': {
                schema: { $ref: '#/components/schemas/Error' },
              },
            },
          },
        },
      },
    },
    '/api/appointments/{id}': {
      get: {
        tags: ['Appointments'],
        summary: 'Buscar agendamento por ID',
        parameters: [{ $ref: '#/components/parameters/IdParam' }],
        responses: {
          '200': {
            description: 'Agendamento encontrado',
            content: {
              'application/json': {
                schema: { $ref: '#/components/schemas/Appointment' },
              },
            },
          },
          '404': {
            description: 'Agendamento não encontrado',
            content: {
              'application/json': {
                schema: { $ref: '#/components/schemas/Error' },
              },
            },
          },
        },
      },
    },
    '/api/professionals': {
      get: {
        tags: ['Professionals'],
        summary: 'Listar profissionais',
        responses: {
          '200': {
            description: 'Lista de profissionais',
            content: {
              'application/json': {
                schema: {
                  type: 'array',
                  items: { $ref: '#/components/schemas/Professional' },
                },
              },
            },
          },
        },
      },
      post: {
        tags: ['Professionals'],
        summary: 'Criar profissional',
        requestBody: {
          required: true,
          content: {
            'application/json': {
              schema: { $ref: '#/components/schemas/ProfessionalInput' },
            },
          },
        },
        responses: {
          '201': {
            description: 'Profissional criado',
            content: {
              'application/json': {
                schema: { $ref: '#/components/schemas/Professional' },
              },
            },
          },
        },
      },
    },
    '/api/professionals/{id}': {
      get: {
        tags: ['Professionals'],
        summary: 'Buscar profissional por ID',
        parameters: [{ $ref: '#/components/parameters/IdParam' }],
        responses: {
          '200': {
            description: 'Profissional encontrado',
            content: {
              'application/json': {
                schema: { $ref: '#/components/schemas/Professional' },
              },
            },
          },
        },
      },
      put: {
        tags: ['Professionals'],
        summary: 'Atualizar profissional',
        parameters: [{ $ref: '#/components/parameters/IdParam' }],
        requestBody: {
          required: true,
          content: {
            'application/json': {
              schema: { $ref: '#/components/schemas/ProfessionalInput' },
            },
          },
        },
        responses: {
          '200': {
            description: 'Profissional atualizado',
            content: {
              'application/json': {
                schema: { $ref: '#/components/schemas/Professional' },
              },
            },
          },
        },
      },
      delete: {
        tags: ['Professionals'],
        summary: 'Remover profissional',
        parameters: [{ $ref: '#/components/parameters/IdParam' }],
        responses: {
          '204': { description: 'Profissional removido' },
        },
      },
    },
    '/api/services': {
      get: {
        tags: ['Services'],
        summary: 'Listar serviços',
        responses: {
          '200': {
            description: 'Lista de serviços',
            content: {
              'application/json': {
                schema: {
                  type: 'array',
                  items: { $ref: '#/components/schemas/Service' },
                },
              },
            },
          },
        },
      },
      post: {
        tags: ['Services'],
        summary: 'Criar serviço',
        requestBody: {
          required: true,
          content: {
            'application/json': {
              schema: { $ref: '#/components/schemas/ServiceInput' },
            },
          },
        },
        responses: {
          '201': {
            description: 'Serviço criado',
            content: {
              'application/json': {
                schema: { $ref: '#/components/schemas/Service' },
              },
            },
          },
        },
      },
    },
    '/api/services/{id}': {
      get: {
        tags: ['Services'],
        summary: 'Buscar serviço por ID',
        parameters: [{ $ref: '#/components/parameters/IdParam' }],
        responses: {
          '200': {
            description: 'Serviço encontrado',
            content: {
              'application/json': {
                schema: { $ref: '#/components/schemas/Service' },
              },
            },
          },
        },
      },
      put: {
        tags: ['Services'],
        summary: 'Atualizar serviço',
        parameters: [{ $ref: '#/components/parameters/IdParam' }],
        requestBody: {
          required: true,
          content: {
            'application/json': {
              schema: { $ref: '#/components/schemas/ServiceInput' },
            },
          },
        },
        responses: {
          '200': {
            description: 'Serviço atualizado',
            content: {
              'application/json': {
                schema: { $ref: '#/components/schemas/Service' },
              },
            },
          },
        },
      },
      delete: {
        tags: ['Services'],
        summary: 'Remover serviço',
        parameters: [{ $ref: '#/components/parameters/IdParam' }],
        responses: {
          '204': { description: 'Serviço removido' },
        },
      },
    },
    '/api/customers': {
      get: {
        tags: ['Customers'],
        summary: 'Listar clientes',
        responses: {
          '200': {
            description: 'Lista de clientes',
            content: {
              'application/json': {
                schema: {
                  type: 'array',
                  items: { $ref: '#/components/schemas/Customer' },
                },
              },
            },
          },
        },
      },
      post: {
        tags: ['Customers'],
        summary: 'Criar cliente',
        requestBody: {
          required: true,
          content: {
            'application/json': {
              schema: { $ref: '#/components/schemas/CustomerInput' },
            },
          },
        },
        responses: {
          '201': {
            description: 'Cliente criado',
            content: {
              'application/json': {
                schema: { $ref: '#/components/schemas/Customer' },
              },
            },
          },
        },
      },
    },
    '/api/customers/{id}': {
      get: {
        tags: ['Customers'],
        summary: 'Buscar cliente por ID',
        parameters: [{ $ref: '#/components/parameters/IdParam' }],
        responses: {
          '200': {
            description: 'Cliente encontrado',
            content: {
              'application/json': {
                schema: { $ref: '#/components/schemas/Customer' },
              },
            },
          },
        },
      },
      put: {
        tags: ['Customers'],
        summary: 'Atualizar cliente',
        parameters: [{ $ref: '#/components/parameters/IdParam' }],
        requestBody: {
          required: true,
          content: {
            'application/json': {
              schema: { $ref: '#/components/schemas/CustomerInput' },
            },
          },
        },
        responses: {
          '200': {
            description: 'Cliente atualizado',
            content: {
              'application/json': {
                schema: { $ref: '#/components/schemas/Customer' },
              },
            },
          },
        },
      },
      delete: {
        tags: ['Customers'],
        summary: 'Remover cliente',
        parameters: [{ $ref: '#/components/parameters/IdParam' }],
        responses: {
          '204': { description: 'Cliente removido' },
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
