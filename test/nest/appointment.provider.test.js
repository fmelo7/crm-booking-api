const test = require('node:test');
const assert = require('node:assert/strict');
const AppointmentProvider = require('../../src/nest/appointment/appointment.provider');

const ids = {
  customer: '64b7f8f8f8f8f8f8f8f8f801',
  service: '64b7f8f8f8f8f8f8f8f8f802',
  professional: '64b7f8f8f8f8f8f8f8f8f803',
};

const createProvider = ({ conflict = null, durationMinutes = 90 } = {}) => {
  const created = [];
  const appointmentRepository = {
    created,
    async create(data) {
      created.push(data);
      return { id: 'appointment-id', _id: 'appointment-id', ...data };
    },
    async paginate() {
      return { data: [], pagination: { total: 0 } };
    },
    async findById() {
      return null;
    },
    async findByIdPopulated() {
      return null;
    },
    async findConflict() {
      return conflict;
    },
    async findScheduledOverlapping() {
      return [];
    },
  };
  const customerRepository = {
    async findById(id) {
      return id === ids.customer ? { id, _id: id, name: 'Maria Silva' } : null;
    },
  };
  const serviceRepository = {
    async findById(id) {
      return id === ids.service
        ? { id, _id: id, name: 'Corte completo', durationMinutes }
        : null;
    },
  };
  const professionalRepository = {
    async findById(id) {
      return id === ids.professional ? { id, _id: id, name: 'Ana Souza' } : null;
    },
  };

  return {
    appointmentRepository,
    provider: new AppointmentProvider(
      appointmentRepository,
      customerRepository,
      serviceRepository,
      professionalRepository
    ),
  };
};

test('Nest appointment provider creates using injected repositories and service duration', async () => {
  const { appointmentRepository, provider } = createProvider({ durationMinutes: 90 });

  const result = await provider.create({
    customerId: ids.customer,
    serviceId: ids.service,
    professionalId: ids.professional,
    startAt: '2030-01-01T14:00:00.000Z',
    notes: 'Cliente pediu encaixe',
  });

  assert.equal(result.customer, ids.customer);
  assert.equal(result.service, ids.service);
  assert.equal(result.professional, ids.professional);
  assert.equal(result.endAt.toISOString(), '2030-01-01T15:30:00.000Z');
  assert.equal(appointmentRepository.created.length, 1);
});

test('Nest appointment provider rejects conflicts before creating', async () => {
  const { appointmentRepository, provider } = createProvider({
    conflict: { id: 'existing-appointment' },
  });

  await assert.rejects(
    () => provider.create({
      customerId: ids.customer,
      serviceId: ids.service,
      professionalId: ids.professional,
      startAt: '2030-01-01T14:00:00.000Z',
    }),
    {
      status: 409,
      message: 'Horário ocupado',
    }
  );
  assert.equal(appointmentRepository.created.length, 0);
});
