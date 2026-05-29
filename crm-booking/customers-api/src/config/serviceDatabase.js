const SERVICE_DATABASES = {
  'appointments-api': {
    domain: 'appointments',
    mongoUriEnv: 'APPOINTMENTS_MONGODB_URI',
    postgresUriEnv: 'APPOINTMENTS_POSTGRES_URI',
    databaseUrlEnv: 'APPOINTMENTS_DATABASE_URL',
  },
  'customers-api': {
    domain: 'customers',
    mongoUriEnv: 'CUSTOMERS_MONGODB_URI',
    postgresUriEnv: 'CUSTOMERS_POSTGRES_URI',
    databaseUrlEnv: 'CUSTOMERS_DATABASE_URL',
  },
  'services-api': {
    domain: 'services',
    mongoUriEnv: 'SERVICES_MONGODB_URI',
    postgresUriEnv: 'SERVICES_POSTGRES_URI',
    databaseUrlEnv: 'SERVICES_DATABASE_URL',
  },
  'professionals-api': {
    domain: 'professionals',
    mongoUriEnv: 'PROFESSIONALS_MONGODB_URI',
    postgresUriEnv: 'PROFESSIONALS_POSTGRES_URI',
    databaseUrlEnv: 'PROFESSIONALS_DATABASE_URL',
  },
};

const DEFAULT_SERVICE_NAME = 'api-gateway';

const normalizeServiceName = (value = process.env.SERVICE_NAME) =>
  value?.trim() || DEFAULT_SERVICE_NAME;

const getServiceDatabaseConfig = (serviceName = normalizeServiceName()) => {
  const normalized = normalizeServiceName(serviceName);

  return {
    serviceName: normalized,
    domain: SERVICE_DATABASES[normalized]?.domain || 'monolith',
    mongoUriEnv: SERVICE_DATABASES[normalized]?.mongoUriEnv || 'MONGODB_URI',
    postgresUriEnv: SERVICE_DATABASES[normalized]?.postgresUriEnv || 'POSTGRES_URI',
    databaseUrlEnv: SERVICE_DATABASES[normalized]?.databaseUrlEnv || 'DATABASE_URL',
    isolated: Boolean(SERVICE_DATABASES[normalized]),
  };
};

const readServiceDatabaseEnv = (serviceName = normalizeServiceName()) => {
  const config = getServiceDatabaseConfig(serviceName);

  return {
    ...config,
    mongoUri: process.env[config.mongoUriEnv] || process.env.MONGODB_URI,
    postgresUri: process.env[config.postgresUriEnv] || process.env[config.databaseUrlEnv] ||
      process.env.POSTGRES_URI || process.env.DATABASE_URL,
    hasOwnMongoUri: Boolean(process.env[config.mongoUriEnv]),
    hasOwnPostgresUri: Boolean(process.env[config.postgresUriEnv] || process.env[config.databaseUrlEnv]),
  };
};

module.exports = {
  getServiceDatabaseConfig,
  normalizeServiceName,
  readServiceDatabaseEnv,
  SERVICE_DATABASES,
};
