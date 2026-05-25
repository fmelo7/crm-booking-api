const SUPPORTED_DATABASE_PROVIDERS = ['mongodb', 'postgres'];

const normalizeProvider = (value) =>
  value?.trim().replace(/^["']|["']$/g, '').toLowerCase();

const getDatabaseProvider = () => {
  const provider = normalizeProvider(
    process.env.DATABASE_PROVIDER ||
    (process.env.POSTGRES_URI || process.env.DATABASE_URL ? 'postgres' : 'mongodb')
  );

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
  SUPPORTED_DATABASE_PROVIDERS,
};
