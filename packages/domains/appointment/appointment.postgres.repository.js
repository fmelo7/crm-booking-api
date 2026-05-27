const { createId, query } = require('../../../src/config/postgres');
const { createPagination } = require('../../shared/common/postgresPagination');
const { normalizePagination } = require('../../shared/common/pagination');
const {
  mapAppointment: mapStandardAppointment,
  mapCustomer,
  mapProfessional,
  mapService,
} = require('../../shared/common/repositoryMappers');

const normalizeReschedules = (value) => {
  if (Array.isArray(value)) return value;
  if (!value) return [];
  return JSON.parse(value);
};

const mapJoinedCustomer = (row) => row?.customer_id && mapCustomer({
  id: row.customer_id,
  name: row.customer_name,
  phone: row.customer_phone,
  email: row.customer_email,
  notes: row.customer_notes,
});

const mapJoinedService = (row) => row?.service_id && mapService({
  id: row.service_id,
  name: row.service_name,
  description: row.service_description,
  duration_minutes: row.service_duration_minutes,
  price: row.service_price,
});

const mapJoinedProfessional = (row) => row?.professional_id && mapProfessional({
  id: row.professional_id,
  name: row.professional_name,
  category: row.professional_category,
  phone: row.professional_phone,
  email: row.professional_email,
  active: row.professional_active,
});

const mapAppointment = (row, { populated = false } = {}) => {
  if (!row) return row;

  return mapStandardAppointment({
    ...row,
    reschedules: normalizeReschedules(row.reschedules),
    customer: populated ? mapJoinedCustomer(row) : row.customer_id,
    service: populated ? mapJoinedService(row) : row.service_id,
    professional: populated ? mapJoinedProfessional(row) : row.professional_id,
  });
};

const attachDocumentMethods = (appointment) => {
  if (!appointment) return appointment;

  appointment.save = async () => {
    const result = await query(
      `UPDATE appointments
       SET start_at = $2, end_at = $3, status = $4, reschedules = $5::jsonb, notes = $6, updated_at = NOW()
       WHERE id = $1
       RETURNING *`,
      [
        appointment._id,
        appointment.startAt,
        appointment.endAt,
        appointment.status,
        JSON.stringify(appointment.reschedules || []),
        appointment.notes || null,
      ]
    );
    Object.assign(appointment, mapAppointment(result.rows[0]));
    return appointment;
  };

  appointment.populate = async () => exports.findByIdPopulated(appointment._id);

  return appointment;
};

const buildAppointmentWhere = (criteria = {}, alias = 'appointments') => {
  const conditions = [];
  const values = [];
  const column = (name) => `${alias}.${name}`;
  const add = (sql, value) => {
    values.push(value);
    conditions.push(sql.replace('?', `$${values.length}`));
  };

  if (criteria.professional) add(`${column('professional_id')} = ?`, criteria.professional);
  if (criteria.customer) add(`${column('customer_id')} = ?`, criteria.customer);
  if (criteria.status) add(`${column('status')} = ?`, criteria.status);
  if (criteria.startAt?.$gte) add(`${column('start_at')} >= ?`, criteria.startAt.$gte);
  if (criteria.startAt?.$lt) add(`${column('start_at')} < ?`, criteria.startAt.$lt);
  if (criteria.startAt?.$lte) add(`${column('start_at')} <= ?`, criteria.startAt.$lte);

  return {
    where: conditions.length ? `WHERE ${conditions.join(' AND ')}` : '',
    values,
  };
};

const populatedSelect = `
  appointments.*,
  customers.id AS customer_id,
  customers.name AS customer_name,
  customers.phone AS customer_phone,
  customers.email AS customer_email,
  customers.notes AS customer_notes,
  services.id AS service_id,
  services.name AS service_name,
  services.description AS service_description,
  services.duration_minutes AS service_duration_minutes,
  services.price AS service_price,
  professionals.id AS professional_id,
  professionals.name AS professional_name,
  professionals.category AS professional_category,
  professionals.phone AS professional_phone,
  professionals.email AS professional_email,
  professionals.active AS professional_active
`;

const populatedJoins = `
  JOIN customers ON customers.id = appointments.customer_id
  JOIN services ON services.id = appointments.service_id
  JOIN professionals ON professionals.id = appointments.professional_id
`;

exports.create = async (data) => {
  const id = createId();
  const result = await query(
    `INSERT INTO appointments (id, customer_id, service_id, professional_id, start_at, end_at, status, notes)
     VALUES ($1, $2, $3, $4, $5, $6, $7, $8)
     RETURNING *`,
    [id, data.customer, data.service, data.professional, data.startAt, data.endAt, data.status || 'scheduled', data.notes || null]
  );

  return mapAppointment(result.rows[0]);
};

exports.paginate = async (criteria = {}, options = {}) => {
  const { page, limit, skip } = normalizePagination(options);
  const { where, values } = buildAppointmentWhere(criteria);
  const dataParams = [...values, limit, skip];
  const select = options.populate ? populatedSelect : 'appointments.*';
  const joins = options.populate ? populatedJoins : '';
  const dataResult = await query(
    `SELECT ${select}
     FROM appointments
     ${joins}
     ${where}
     ORDER BY appointments.start_at ASC
     LIMIT $${dataParams.length - 1} OFFSET $${dataParams.length}`,
    dataParams
  );
  const countResult = await query(`SELECT COUNT(*) AS total FROM appointments ${where}`, values);
  const total = Number(countResult.rows[0]?.total || 0);

  return {
    data: dataResult.rows.map((row) => mapAppointment(row, { populated: Boolean(options.populate) })),
    pagination: createPagination({ page, limit, total }),
  };
};

exports.findById = async (id) => {
  const result = await query('SELECT * FROM appointments WHERE id = $1', [id]);
  return attachDocumentMethods(mapAppointment(result.rows[0]));
};

exports.findByIdPopulated = async (id) => {
  const result = await query(
    `SELECT ${populatedSelect}
     FROM appointments
     ${populatedJoins}
     WHERE appointments.id = $1`,
    [id]
  );

  return mapAppointment(result.rows[0], { populated: true });
};

exports.findConflict = async ({ professionalId, startDate, endDate, excludeId }) => {
  const values = [professionalId, endDate, startDate];
  const excludeSql = excludeId ? `AND id <> $${values.push(excludeId)}` : '';
  const result = await query(
    `SELECT * FROM appointments
     WHERE professional_id = $1
       AND status = 'scheduled'
       AND start_at < $2
       AND end_at > $3
       ${excludeSql}
     LIMIT 1`,
    values
  );

  return mapAppointment(result.rows[0]);
};

exports.findScheduledOverlapping = async ({ professionalId, startDate, endDate }) => {
  const result = await query(
    `SELECT * FROM appointments
     WHERE professional_id = $1
       AND status = 'scheduled'
       AND start_at < $2
       AND end_at > $3`,
    [professionalId, endDate, startDate]
  );

  return result.rows.map(mapAppointment);
};

exports.existsForCustomer = async (customerId) => {
  const result = await query('SELECT 1 FROM appointments WHERE customer_id = $1 LIMIT 1', [customerId]);
  return result.rowCount > 0;
};

exports.existsForService = async (serviceId) => {
  const result = await query('SELECT 1 FROM appointments WHERE service_id = $1 LIMIT 1', [serviceId]);
  return result.rowCount > 0;
};

exports.existsForProfessional = async (professionalId) => {
  const result = await query('SELECT 1 FROM appointments WHERE professional_id = $1 LIMIT 1', [professionalId]);
  return result.rowCount > 0;
};
