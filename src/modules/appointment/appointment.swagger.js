module.exports = {
  schemas: {
    AppointmentInput: {
      type: 'object',
      required: ['customerId', 'serviceId', 'professionalId', 'startAt'],
      properties: {
        customerId: { type: 'string', example: '665f1d6f7c2a8e0012345671' },
        serviceId: { type: 'string', example: '665f1d6f7c2a8e0012345672' },
        professionalId: { type: 'string', example: '665f1d6f7c2a8e0012345673' },
        startAt: { type: 'string', format: 'date-time', example: '2026-05-21T14:00:00.000Z' },
        notes: { type: 'string', example: 'Cliente pediu encaixe' },
      },
    },
    Appointment: {
      type: 'object',
      properties: {
        _id: { type: 'string' },
        customer: { type: 'string', example: '665f1d6f7c2a8e0012345671' },
        service: { type: 'string', example: '665f1d6f7c2a8e0012345672' },
        professional: { type: 'string', example: '665f1d6f7c2a8e0012345673' },
        startAt: { type: 'string', format: 'date-time', example: '2026-05-21T14:00:00.000Z' },
        endAt: {
          type: 'string',
          format: 'date-time',
          example: '2026-05-21T15:00:00.000Z',
          description: 'Gerado automaticamente pela API a partir do durationMinutes do serviço',
        },
        status: {
          type: 'string',
          enum: ['scheduled', 'cancelled', 'completed'],
          example: 'scheduled',
        },
        reschedules: {
          type: 'array',
          items: {
            type: 'object',
            properties: {
              oldStartAt: { type: 'string', format: 'date-time' },
              oldEndAt: { type: 'string', format: 'date-time' },
              changedAt: { type: 'string', format: 'date-time' },
            },
          },
        },
        notes: { type: 'string', example: 'Cliente pediu encaixe' },
        createdAt: { type: 'string', format: 'date-time' },
        updatedAt: { type: 'string', format: 'date-time' },
      },
    },
    AppointmentRescheduleInput: {
      type: 'object',
      required: ['startAt'],
      properties: {
        startAt: { type: 'string', format: 'date-time', example: '2026-05-21T16:00:00.000Z' },
        notes: { type: 'string', example: 'Cliente pediu para remarcar' },
      },
    },
  },
  paths: {
    '/api/appointments': {
      get: {
        tags: ['Appointments'],
        summary: 'Listar agendamentos',
        parameters: [
          { name: 'date', in: 'query', schema: { type: 'string', example: '2026-05-21' } },
          { name: 'from', in: 'query', schema: { type: 'string', format: 'date-time' } },
          { name: 'to', in: 'query', schema: { type: 'string', format: 'date-time' } },
          { name: 'professionalId', in: 'query', schema: { type: 'string' } },
          { name: 'customerId', in: 'query', schema: { type: 'string' } },
          { name: 'status', in: 'query', schema: { type: 'string', enum: ['scheduled', 'cancelled', 'completed'] } },
        ],
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
          '404': {
            description: 'Cliente, serviço ou profissional não encontrado',
            content: {
              'application/json': {
                schema: { $ref: '#/components/schemas/Error' },
              },
            },
          },
          '409': {
            description: 'Horário ocupado',
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
    '/api/appointments/{id}/reschedule': {
      put: {
        tags: ['Appointments'],
        summary: 'Reagendar agendamento',
        parameters: [{ $ref: '#/components/parameters/IdParam' }],
        requestBody: {
          required: true,
          content: {
            'application/json': {
              schema: { $ref: '#/components/schemas/AppointmentRescheduleInput' },
            },
          },
        },
        responses: {
          '200': {
            description: 'Agendamento reagendado',
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
          '404': {
            description: 'Agendamento não encontrado',
            content: {
              'application/json': {
                schema: { $ref: '#/components/schemas/Error' },
              },
            },
          },
          '409': {
            description: 'Horário ocupado',
            content: {
              'application/json': {
                schema: { $ref: '#/components/schemas/Error' },
              },
            },
          },
        },
      },
    },
    '/api/appointments/{id}/cancel': {
      delete: {
        tags: ['Appointments'],
        summary: 'Cancelar agendamento',
        parameters: [{ $ref: '#/components/parameters/IdParam' }],
        responses: {
          '200': {
            description: 'Agendamento marcado como cancelado',
            content: {
              'application/json': {
                schema: { $ref: '#/components/schemas/Appointment' },
              },
            },
          },
          '400': {
            description: 'ID inválido',
            content: {
              'application/json': {
                schema: { $ref: '#/components/schemas/Error' },
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
          '409': {
            description: 'Agendamento não pode ser cancelado',
            content: {
              'application/json': {
                schema: { $ref: '#/components/schemas/Error' },
              },
            },
          },
        },
      },
    },
    '/api/appointments/{id}/complete': {
      patch: {
        tags: ['Appointments'],
        summary: 'Concluir agendamento',
        parameters: [{ $ref: '#/components/parameters/IdParam' }],
        responses: {
          '200': {
            description: 'Agendamento marcado como concluido',
            content: {
              'application/json': {
                schema: { $ref: '#/components/schemas/Appointment' },
              },
            },
          },
          '400': {
            description: 'ID inválido',
            content: {
              'application/json': {
                schema: { $ref: '#/components/schemas/Error' },
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
          '409': {
            description: 'Agendamento não pode ser concluido',
            content: {
              'application/json': {
                schema: { $ref: '#/components/schemas/Error' },
              },
            },
          },
        },
      },
    },
  },
};
