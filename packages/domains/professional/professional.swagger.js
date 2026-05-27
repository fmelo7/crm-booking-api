module.exports = {
  schemas: {
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
  },
  paths: {
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
  },
};
