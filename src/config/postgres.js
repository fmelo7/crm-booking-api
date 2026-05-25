const crypto = require('crypto');

const DEFAULT_POSTGRES_URI = 'postgres://postgres:postgres@127.0.0.1:5432/crm_booking_api';

let pool;

const normalizeUri = (value) =>
  value?.trim().replace(/^["']|["']$/g, '');

const getPostgresUri = () => {
  log('info', 'Resolving PostgreSQL connection URI', {
    envPostgresUri: Boolean(process.env.POSTGRES_URI),
    envDatabaseUrl: Boolean(process.env.DATABASE_URL),
  });
  log('debug', 'Environment variables for PostgreSQL URI', {
    POSTGRES_URI: process.env.POSTGRES_URI,
    DATABASE_URL: process.env.DATABASE_URL,
  });
  return normalizeUri(process.env.POSTGRES_URI || process.env.DATABASE_URL) || DEFAULT_POSTGRES_URI;
}

const getPg = () => {
  try {
    return require('pg');
  } catch (err) {
    throw new Error('Dependência "pg" não instalada. Execute npm install pg para usar DATABASE_PROVIDER=postgres.');
  }
};

const getPool = () => {
  if (!pool) {
    const { Pool } = getPg();
    pool = new Pool({
      connectionString: getPostgresUri(),
    });
  }

  return pool;
};

const query = (text, params) => getPool().query(text, params);

const createId = () => crypto.randomBytes(12).toString('hex');

const initSchema = async () => {
  await query(`
    CREATE TABLE IF NOT EXISTS customers (
      id VARCHAR(24) PRIMARY KEY,
      name TEXT NOT NULL,
      phone TEXT,
      email TEXT,
      notes TEXT,
      created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
      updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
    );

    CREATE TABLE IF NOT EXISTS services (
      id VARCHAR(24) PRIMARY KEY,
      name TEXT NOT NULL,
      description TEXT,
      duration_minutes INTEGER NOT NULL DEFAULT 60,
      price NUMERIC(12, 2) NOT NULL DEFAULT 0,
      created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
      updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
    );

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

    CREATE TABLE IF NOT EXISTS appointments (
      id VARCHAR(24) PRIMARY KEY,
      customer_id VARCHAR(24) NOT NULL REFERENCES customers(id),
      service_id VARCHAR(24) NOT NULL REFERENCES services(id),
      professional_id VARCHAR(24) NOT NULL REFERENCES professionals(id),
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
  `);
};

const connectPostgres = async (uri = getPostgresUri()) => {
  process.env.POSTGRES_URI = uri;
  await query('SELECT 1');
  await initSchema();
  return uri;
};

const closePostgres = async () => {
  if (pool) {
    await pool.end();
    pool = undefined;
  }
};

module.exports = {
  closePostgres,
  connectPostgres,
  createId,
  DEFAULT_POSTGRES_URI,
  getPostgresUri,
  query,
};
