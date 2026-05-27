const parseStartAt = (startAt) => {
  const startDate = new Date(startAt);
  if (isNaN(startDate)) {
    throw { status: 400, message: 'startAt inválido' };
  }

  if (startDate < new Date()) {
    throw { status: 400, message: 'Não é possível agendar no passado' };
  }

  return startDate;
};

const calculateEndAt = (startDate, durationMinutes) =>
  new Date(startDate.getTime() + durationMinutes * 60000);

const buildAppointmentListQuery = (filters = {}) => {
  const query = {};

  if (filters.professionalId) {
    query.professional = filters.professionalId;
  }

  if (filters.customerId) {
    query.customer = filters.customerId;
  }

  if (filters.status) {
    query.status = filters.status;
  }

  if (filters.date) {
    const selectedDate = new Date(`${filters.date}T00:00:00`);
    if (isNaN(selectedDate)) {
      throw { status: 400, message: 'Data inválida' };
    }

    const nextDay = new Date(selectedDate);
    nextDay.setDate(nextDay.getDate() + 1);

    query.startAt = {
      $gte: selectedDate,
      $lt: nextDay,
    };
  } else if (filters.from || filters.to) {
    query.startAt = {};

    if (filters.from) {
      const from = new Date(filters.from);
      if (isNaN(from)) throw { status: 400, message: 'Data inicial inválida' };
      query.startAt.$gte = from;
    }

    if (filters.to) {
      const to = new Date(filters.to);
      if (isNaN(to)) throw { status: 400, message: 'Data final inválida' };
      query.startAt.$lte = to;
    }
  }

  return query;
};

const buildAvailabilityWindow = (date) => {
  if (!date) {
    throw { status: 400, message: 'Data é obrigatória' };
  }

  const selectedDate = new Date(`${date}T00:00:00`);

  if (isNaN(selectedDate)) {
    throw { status: 400, message: 'Data inválida' };
  }

  const startOfDay = new Date(selectedDate);
  startOfDay.setHours(9, 0, 0, 0);

  const endOfDay = new Date(selectedDate);
  endOfDay.setHours(18, 0, 0, 0);

  return { startOfDay, endOfDay };
};

const buildAvailableSlots = ({
  appointments,
  durationMinutes,
  endOfDay,
  startOfDay,
  slotInterval = 30,
}) => {
  const slots = [];

  for (
    let current = new Date(startOfDay);
    current < endOfDay;
    current = new Date(current.getTime() + slotInterval * 60000)
  ) {
    const slotStart = new Date(current);
    const slotEnd = new Date(
      slotStart.getTime() + durationMinutes * 60000
    );

    if (slotEnd > endOfDay) break;

    const hasConflict = appointments.some(app =>
      app.startAt < slotEnd && app.endAt > slotStart
    );

    if (!hasConflict) {
      slots.push(slotStart);
    }
  }

  return slots;
};

const ensureScheduled = (appointment, action) => {
  if (appointment.status !== 'scheduled') {
    throw { status: 409, message: `Agendamento ${appointment.status} não pode ser ${action}` };
  }
};

module.exports = {
  buildAvailabilityWindow,
  buildAvailableSlots,
  buildAppointmentListQuery,
  calculateEndAt,
  ensureScheduled,
  parseStartAt,
};
