const { createId, query } = require('../../config/postgres');
const { createPagination } = require('../../shared/common/postgresPagination');
const { normalizePagination } = require('../../shared/common/pagination');
const { mapCustomer } = require('../../shared/common/repositoryMappers');

const buildSearchWhere = (search) => {
  if (!search) return { where: '', values: [] };
  return {
    where: 'WHERE name ILIKE $1 OR email ILIKE $1 OR phone ILIKE $1',
    values: [`%${search}%`],
  };
};

const getSearchTerm = (criteria) => criteria?.$or?.[0]?.name?.source;

exports.create = async (data) => {
  const id = createId();
  const result = await query(
    `INSERT INTO customers (id, name, phone, email, notes)
     VALUES ($1, $2, $3, $4, $5)
     RETURNING *`,
    [id, data.name, data.phone || null, data.email || null, data.notes || null]
  );

  return mapCustomer(result.rows[0]);
};

exports.paginate = async (criteria = {}, options = {}) => {
  const { page, limit, skip } = normalizePagination(options);
  const { where, values } = buildSearchWhere(getSearchTerm(criteria));
  const dataParams = [...values, limit, skip];
  const dataResult = await query(
    `SELECT * FROM customers ${where} ORDER BY name ASC LIMIT $${dataParams.length - 1} OFFSET $${dataParams.length}`,
    dataParams
  );
  const countResult = await query(`SELECT COUNT(*) AS total FROM customers ${where}`, values);
  const total = Number(countResult.rows[0]?.total || 0);

  return {
    data: dataResult.rows.map(mapCustomer),
    pagination: createPagination({ page, limit, total }),
  };
};

exports.findById = async (id) => {
  const result = await query('SELECT * FROM customers WHERE id = $1', [id]);
  return mapCustomer(result.rows[0]);
};

exports.updateById = async (id, data) => {
  const result = await query(
    `UPDATE customers
     SET name = $2, phone = $3, email = $4, notes = $5, updated_at = NOW()
     WHERE id = $1
     RETURNING *`,
    [id, data.name, data.phone || null, data.email || null, data.notes || null]
  );

  return mapCustomer(result.rows[0]);
};

exports.deleteById = async (id) => {
  const result = await query('DELETE FROM customers WHERE id = $1 RETURNING *', [id]);
  return mapCustomer(result.rows[0]);
};
