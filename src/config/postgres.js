const crypto = require('crypto');
const { readServiceDatabaseEnv } = require('./serviceDatabase');

const DEFAULT_POSTGRES_URI = 'postgres://postgres:postgres@127.0.0.1:5432/crm_booking_api';

const pools = new Map();

const normalizeUri = (value) =>
  value?.trim().replace(/^["']|["']$/g, '');

const getPostgresUri = (serviceName = process.env.SERVICE_NAME) =>
  normalizeUri(readServiceDatabaseEnv(serviceName).postgresUri) || DEFAULT_POSTGRES_URI;

const getPg = () => {
  try {
    return require('pg');
  } catch (err) {
    throw new Error('Dependência "pg" não instalada. Execute npm install pg para usar DATABASE_PROVIDER=postgres.');
  }
};

const getPool = (serviceName = process.env.SERVICE_NAME) => {
  const uri = getPostgresUri(serviceName);

  if (!pools.has(uri)) {
    const { Pool } = getPg();
    pools.set(uri, new Pool({ connectionString: uri }));
  }

  return pools.get(uri);
};

const query = (text, params, options = {}) => getPool(options.serviceName).query(text, params);

const createId = () => crypto.randomBytes(12).toString('hex');

const TABLE_MIGRATIONS = {
  customers: `
    CREATE TABLE IF NOT EXISTS customers (
      id VARCHAR(24) PRIMARY KEY,
      name TEXT NOT NULL,
      phone TEXT,
      email TEXT,
      notes TEXT,
      created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
      updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
    );
  `,
  services: `
    CREATE TABLE IF NOT EXISTS services (
      id VARCHAR(24) PRIMARY KEY,
      name TEXT NOT NULL,
      description TEXT,
      duration_minutes INTEGER NOT NULL DEFAULT 60,
      price NUMERIC(12, 2) NOT NULL DEFAULT 0,
      created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
      updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
    );
  `,
  professionals: `
    CREATE TABLE IF NOT EXISTS professionals (
      id VARCHAR(24) PRIMARY KEY,
      name TEXT NOT NULL,
      category TEXT NOT NULL,
      phone TEXT,
      email TEXT,
      active BOOLEAN NOT NULL DEFAULT TRUE,
      created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
      updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
    );
  `,
  appointments: `
    CREATE TABLE IF NOT EXISTS appointments (
      id VARCHAR(24) PRIMARY KEY,
      customer_id VARCHAR(24) NOT NULL,
      service_id VARCHAR(24) NOT NULL,
      professional_id VARCHAR(24) NOT NULL,
      start_at TIMESTAMPTZ NOT NULL,
      end_at TIMESTAMPTZ NOT NULL,
      status TEXT NOT NULL DEFAULT 'scheduled' CHECK (status IN ('scheduled', 'cancelled', 'completed')),
      reschedules JSONB NOT NULL DEFAULT '[]'::jsonb,
      notes TEXT,
      created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
      updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
    );

    CREATE INDEX IF NOT EXISTS idx_appointments_professional_time
      ON appointments (professional_id, start_at, end_at);
  `,
};

const DOMAIN_MIGRATIONS = {
  appointments: [
    TABLE_MIGRATIONS.customers,
    TABLE_MIGRATIONS.services,
    TABLE_MIGRATIONS.professionals,
    TABLE_MIGRATIONS.appointments,
  ],
  customers: [TABLE_MIGRATIONS.customers],
  services: [TABLE_MIGRATIONS.services],
  professionals: [TABLE_MIGRATIONS.professionals],
  monolith: [
    TABLE_MIGRATIONS.customers,
    TABLE_MIGRATIONS.services,
    TABLE_MIGRATIONS.professionals,
    TABLE_MIGRATIONS.appointments,
  ],
};

const getPostgresMigrations = (serviceName = process.env.SERVICE_NAME) => {
  const { domain } = readServiceDatabaseEnv(serviceName);
  return DOMAIN_MIGRATIONS[domain] || DOMAIN_MIGRATIONS.monolith;
};

const initSchema = async (serviceName = process.env.SERVICE_NAME) => {
  const migrations = getPostgresMigrations(serviceName);

  for (const migration of migrations) {
    await query(migration, undefined, { serviceName });
  }
};

const connectPostgres = async (uri = getPostgresUri(), options = {}) => {
  const serviceName = options.serviceName || process.env.SERVICE_NAME;
  process.env.POSTGRES_URI = uri;
  await query('SELECT 1', undefined, { serviceName });
  await initSchema(serviceName);
  return uri;
};

const closePostgres = async () => {
  for (const pool of pools.values()) {
    await pool.end();
  }

  pools.clear();
};

module.exports = {
  closePostgres,
  connectPostgres,
  createId,
  DEFAULT_POSTGRES_URI,
  getPostgresMigrations,
  getPostgresUri,
  query,
};
