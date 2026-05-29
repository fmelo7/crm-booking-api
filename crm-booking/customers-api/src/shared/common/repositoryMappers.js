const normalizeId = (value) => {
  if (!value) return value;
  return String(value);
};

const normalizeDate = (value) => {
  if (!value) return value;
  return value instanceof Date ? value : new Date(value);
};

const toPlain = (record) => {
  if (!record) return record;
  if (typeof record.toObject === 'function') {
    return record.toObject();
  }
  return record;
};

const withStandardFields = (record) => {
  if (!record) return record;
  const source = toPlain(record);
  const id = normalizeId(source._id || source.id);

  return {
    ...source,
    _id: id,
    id,
    createdAt: normalizeDate(source.createdAt || source.created_at),
    updatedAt: normalizeDate(source.updatedAt || source.updated_at),
  };
};

const mapCustomer = (record) => {
  const source = withStandardFields(record);
  return source && {
    _id: source._id,
    id: source.id,
    name: source.name,
    phone: source.phone,
    email: source.email,
    notes: source.notes,
    createdAt: source.createdAt,
    updatedAt: source.updatedAt,
  };
};

const mapService = (record) => {
  const source = withStandardFields(record);
  return source && {
    _id: source._id,
    id: source.id,
    name: source.name,
    description: source.description,
    durationMinutes: source.durationMinutes ?? source.duration_minutes,
    price: Number(source.price || 0),
    createdAt: source.createdAt,
    updatedAt: source.updatedAt,
  };
};

const mapProfessional = (record) => {
  const source = withStandardFields(record);
  return source && {
    _id: source._id,
    id: source.id,
    name: source.name,
    category: source.category,
    phone: source.phone,
    email: source.email,
    active: source.active,
    createdAt: source.createdAt,
    updatedAt: source.updatedAt,
  };
};

const normalizeReschedules = (value) => {
  if (Array.isArray(value)) return value;
  if (!value) return [];
  return JSON.parse(value);
};

const isEntityObject = (value) =>
  value && typeof value === 'object' && 'name' in value;

const mapAppointment = (record) => {
  const source = withStandardFields(record);
  return source && {
    _id: source._id,
    id: source.id,
    customer: isEntityObject(source.customer)
      ? mapCustomer(source.customer)
      : normalizeId(source.customer ?? source.customer_id),
    service: isEntityObject(source.service)
      ? mapService(source.service)
      : normalizeId(source.service ?? source.service_id),
    professional: isEntityObject(source.professional)
      ? mapProfessional(source.professional)
      : normalizeId(source.professional ?? source.professional_id),
    startAt: normalizeDate(source.startAt || source.start_at),
    endAt: normalizeDate(source.endAt || source.end_at),
    status: source.status,
    reschedules: normalizeReschedules(source.reschedules),
    notes: source.notes,
    createdAt: source.createdAt,
    updatedAt: source.updatedAt,
  };
};

const mapPaginated = (result, mapper) => ({
  data: result.data.map(mapper),
  pagination: result.pagination,
});

module.exports = {
  mapAppointment,
  mapCustomer,
  mapPaginated,
  mapProfessional,
  mapService,
  normalizeDate,
  normalizeId,
};
