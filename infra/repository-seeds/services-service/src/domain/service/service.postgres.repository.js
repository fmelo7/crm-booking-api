const { createId, query } = require('../../config/postgres');
const { createPagination } = require('../../shared/common/postgresPagination');
const { normalizePagination } = require('../../shared/common/pagination');
const { mapService } = require('../../shared/common/repositoryMappers');

const getSearchTerm = (criteria) => criteria?.$or?.[0]?.name?.source;

exports.create = async (data) => {
  const id = createId();
  const result = await query(
    `INSERT INTO services (id, name, description, duration_minutes, price)
     VALUES ($1, $2, $3, $4, $5)
     RETURNING *`,
    [id, data.name, data.description || null, data.durationMinutes || 60, data.price || 0]
  );

  return mapService(result.rows[0]);
};

exports.paginate = async (criteria = {}, options = {}) => {
  const { page, limit, skip } = normalizePagination(options);
  const search = getSearchTerm(criteria);
  const where = search ? 'WHERE name ILIKE $1 OR description ILIKE $1' : '';
  const values = search ? [`%${search}%`] : [];
  const dataParams = [...values, limit, skip];
  const dataResult = await query(
    `SELECT * FROM services ${where} ORDER BY name ASC LIMIT $${dataParams.length - 1} OFFSET $${dataParams.length}`,
    dataParams
  );
  const countResult = await query(`SELECT COUNT(*) AS total FROM services ${where}`, values);
  const total = Number(countResult.rows[0]?.total || 0);

  return {
    data: dataResult.rows.map(mapService),
    pagination: createPagination({ page, limit, total }),
  };
};

exports.findById = async (id) => {
  const result = await query('SELECT * FROM services WHERE id = $1', [id]);
  return mapService(result.rows[0]);
};

exports.updateById = async (id, data) => {
  const result = await query(
    `UPDATE services
     SET name = $2, description = $3, duration_minutes = $4, price = $5, updated_at = NOW()
     WHERE id = $1
     RETURNING *`,
    [id, data.name, data.description || null, data.durationMinutes || 60, data.price || 0]
  );

  return mapService(result.rows[0]);
};

exports.deleteById = async (id) => {
  const result = await query('DELETE FROM services WHERE id = $1 RETURNING *', [id]);
  return mapService(result.rows[0]);
};
