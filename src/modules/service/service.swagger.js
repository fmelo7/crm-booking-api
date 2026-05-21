module.exports = {
  schemas: {
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
  },
  paths: {
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
  },
};
