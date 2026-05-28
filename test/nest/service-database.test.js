const test = require('node:test');
const assert = require('node:assert/strict');

const { getDatabaseProvider } = require('../../packages/shared/common/databaseProvider');
const { getPostgresMigrations, getPostgresUri } = require('../../src/config/postgres');
const { readServiceDatabaseEnv } = require('../../src/config/serviceDatabase');

const withEnv = (values, fn) => {
  const previous = {};

  Object.keys(values).forEach((key) => {
    previous[key] = process.env[key];
    if (values[key] === undefined) {
      delete process.env[key];
    } else {
      process.env[key] = values[key];
    }
  });

  try {
    fn();
  } finally {
    Object.entries(previous).forEach(([key, value]) => {
      if (value === undefined) {
        delete process.env[key];
      } else {
        process.env[key] = value;
      }
    });
  }
};

test('service database resolver prefers isolated connection strings', () => {
  withEnv({
    APPOINTMENTS_POSTGRES_URI: 'postgres://user:pass@db/appointments',
    POSTGRES_URI: 'postgres://user:pass@db/monolith',
  }, () => {
    const config = readServiceDatabaseEnv('appointments-service');

    assert.equal(config.domain, 'appointments');
    assert.equal(config.hasOwnPostgresUri, true);
    assert.equal(getPostgresUri('appointments-service'), 'postgres://user:pass@db/appointments');
  });
});

test('provider resolves postgres from service-specific urls', () => {
  withEnv({
    DATABASE_PROVIDER: undefined,
    POSTGRES_URI: undefined,
    DATABASE_URL: undefined,
    MONGODB_URI: undefined,
    CUSTOMERS_POSTGRES_URI: 'postgres://user:pass@db/customers',
  }, () => {
    assert.equal(getDatabaseProvider(), 'postgres');
  });
});

test('postgres migrations are scoped by service domain', () => {
  const customerMigrations = getPostgresMigrations('customers-service').join('\n');
  const appointmentsMigrations = getPostgresMigrations('appointments-service').join('\n');

  assert.match(customerMigrations, /CREATE TABLE IF NOT EXISTS customers/);
  assert.doesNotMatch(customerMigrations, /CREATE TABLE IF NOT EXISTS appointments/);
  assert.match(appointmentsMigrations, /CREATE TABLE IF NOT EXISTS appointments/);
  assert.doesNotMatch(appointmentsMigrations, /REFERENCES customers/);
});
