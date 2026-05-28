const SUPPORTED_DATABASE_PROVIDERS = ['mongodb', 'postgres'];
const SERVICE_DATABASE_PREFIXES = [
  'APPOINTMENTS',
  'CUSTOMERS',
  'SERVICES',
  'PROFESSIONALS',
];

const normalizeProvider = (value) =>
  value?.trim().replace(/^["']|["']$/g, '').toLowerCase();

const isRailwayRuntime = () =>
  Boolean(
    process.env.RAILWAY_ENVIRONMENT_ID ||
    process.env.RAILWAY_ENVIRONMENT_NAME ||
    process.env.RAILWAY_SERVICE_ID ||
    process.env.RAILWAY_PROJECT_ID
  );

const hasServicePostgresUri = () => SERVICE_DATABASE_PREFIXES
  .some((prefix) => process.env[`${prefix}_POSTGRES_URI`] || process.env[`${prefix}_DATABASE_URL`]);

const hasServiceMongoUri = () => SERVICE_DATABASE_PREFIXES
  .some((prefix) => process.env[`${prefix}_MONGODB_URI`]);

const getDatabaseProvider = () => {
  const explicitProvider = normalizeProvider(process.env.DATABASE_PROVIDER);
  const provider = explicitProvider ||
    (process.env.POSTGRES_URI || process.env.DATABASE_URL || hasServicePostgresUri() ? 'postgres' : undefined) ||
    (isRailwayRuntime() && !process.env.MONGODB_URI && !hasServiceMongoUri() ? 'postgres' : 'mongodb');

  if (!SUPPORTED_DATABASE_PROVIDERS.includes(provider)) {
    throw new Error(`DATABASE_PROVIDER inválido: ${provider}`);
  }

  return provider;
};

const getRepositoryProvider = () => {
  const provider = getDatabaseProvider();
  return provider === 'mongodb' ? 'mongo' : provider;
};

module.exports = {
  getDatabaseProvider,
  getRepositoryProvider,
  isRailwayRuntime,
  SUPPORTED_DATABASE_PROVIDERS,
};
