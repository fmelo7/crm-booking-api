const SUPPORTED_DATABASE_PROVIDERS = ['mongodb', 'postgres'];

const getDatabaseProvider = () => {
  const provider = (process.env.DATABASE_PROVIDER || 'mongodb').toLowerCase();

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
