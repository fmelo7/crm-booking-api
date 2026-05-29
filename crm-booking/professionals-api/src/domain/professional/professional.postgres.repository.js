const { createId, query } = require('../../config/postgres');
const { createPagination } = require('../../shared/common/postgresPagination');
const { normalizePagination } = require('../../shared/common/pagination');
const { mapProfessional } = require('../../shared/common/repositoryMappers');

const getSearchTerm = (criteria) => criteria?.$or?.[0]?.name?.source;

exports.create = async (data) => {
  const id = createId();
  const result = await query(
    `INSERT INTO professionals (id, name, category, phone, email, active)
     VALUES ($1, $2, $3, $4, $5, $6)
     RETURNING *`,
    [id, data.name, data.category, data.phone || null, data.email || null, data.active !== false]
  );

  return mapProfessional(result.rows[0]);
};

exports.paginate = async (criteria = {}, options = {}) => {
  const { page, limit, skip } = normalizePagination(options);
  const search = getSearchTerm(criteria);
  const where = search ? 'WHERE name ILIKE $1 OR category ILIKE $1 OR email ILIKE $1 OR phone ILIKE $1' : '';
  const values = search ? [`%${search}%`] : [];
  const dataParams = [...values, limit, skip];
  const dataResult = await query(
    `SELECT * FROM professionals ${where} ORDER BY name ASC LIMIT $${dataParams.length - 1} OFFSET $${dataParams.length}`,
    dataParams
  );
  const countResult = await query(`SELECT COUNT(*) AS total FROM professionals ${where}`, values);
  const total = Number(countResult.rows[0]?.total || 0);

  return {
    data: dataResult.rows.map(mapProfessional),
    pagination: createPagination({ page, limit, total }),
  };
};

exports.findById = async (id) => {
  const result = await query('SELECT * FROM professionals WHERE id = $1', [id]);
  return mapProfessional(result.rows[0]);
};

exports.updateById = async (id, data) => {
  const result = await query(
    `UPDATE professionals
     SET name = $2, category = $3, phone = $4, email = $5, active = $6, updated_at = NOW()
     WHERE id = $1
     RETURNING *`,
    [id, data.name, data.category, data.phone || null, data.email || null, data.active !== false]
  );

  return mapProfessional(result.rows[0]);
};

exports.deleteById = async (id) => {
  const result = await query('DELETE FROM professionals WHERE id = $1 RETURNING *', [id]);
  return mapProfessional(result.rows[0]);
};
