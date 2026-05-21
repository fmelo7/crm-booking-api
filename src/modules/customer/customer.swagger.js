module.exports = {
  schemas: {
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
  },
  paths: {
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
