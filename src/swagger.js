const fs = require('fs');
const path = require('path');

const domainsDir = path.join(__dirname, '../packages/domains');

const findSwaggerFiles = (dir) => fs.readdirSync(dir, { withFileTypes: true })
  .flatMap((entry) => {
    const fullPath = path.join(dir, entry.name);

    if (entry.isDirectory()) {
      return findSwaggerFiles(fullPath);
    }

    return entry.isFile() && entry.name.endsWith('.swagger.js') ? [fullPath] : [];
  });

const swaggerModules = findSwaggerFiles(domainsDir)
  .sort()
  .map((file) => require(file));

const mergeSwaggerModules = (...modules) => ({
  schemas: modules.reduce((acc, moduleSwagger) => ({
    ...acc,
    ...(moduleSwagger.schemas || {}),
  }), {}),
  paths: modules.reduce((acc, moduleSwagger) => ({
    ...acc,
    ...(moduleSwagger.paths || {}),
  }), {}),
});

const modules = mergeSwaggerModules(...swaggerModules);

const swaggerSpec = {
  openapi: '3.0.0',
  info: {
    title: 'CRM Booking API',
    version: '1.0.0',
    description: 'API de agendamento CRM com NestJS e suporte a MongoDB ou PostgreSQL',
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
          error: {
            type: 'object',
            properties: {
              status: { type: 'number', example: 400 },
              code: { type: 'string', example: 'VALIDATION_ERROR' },
              message: { type: 'string', example: 'Erro de validação' },
              details: {
                type: 'array',
                items: {
                  type: 'object',
                  properties: {
                    field: { type: 'string', example: 'email' },
                    message: { type: 'string', example: 'Invalid email' },
                  },
                },
              },
            },
          },
        },
      },
      Pagination: {
        type: 'object',
        properties: {
          page: { type: 'number', example: 1 },
          limit: { type: 'number', example: 20 },
          total: { type: 'number', example: 42 },
          totalPages: { type: 'number', example: 3 },
          hasNextPage: { type: 'boolean', example: true },
          hasPreviousPage: { type: 'boolean', example: false },
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
      ...modules.schemas,
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
    ...modules.paths,
  },
};

module.exports = swaggerSpec;
