const mongoose = require('mongoose');
const { getDatabaseProvider, isRailwayRuntime } = require('../shared/common/databaseProvider');
const { connectPostgres, DEFAULT_POSTGRES_URI, getPostgresUri } = require('./postgres');
const { readServiceDatabaseEnv } = require('./serviceDatabase');
const { log } = require('../middlewares/logger');

const DEFAULT_MONGODB_URI = 'mongodb://127.0.0.1:27017/crm-booking-api';

const connectMongo = async (uri = process.env.MONGODB_URI || DEFAULT_MONGODB_URI) => {
  await mongoose.connect(uri);
  return uri;
};

const connectDatabase = async (options = {}) => {
  const serviceName = options.serviceName || process.env.SERVICE_NAME;
  const serviceDatabase = readServiceDatabaseEnv(serviceName);
  const provider = getDatabaseProvider();

  if (provider === 'postgres') {
    log('info', 'Using PostgreSQL database', { databaseProvider: provider });
    log('info', 'PostgreSQL connection URI', {
      serviceName: serviceDatabase.serviceName,
      databaseDomain: serviceDatabase.domain,
      ownConnection: serviceDatabase.hasOwnPostgresUri,
      uri: maskDatabaseUri(getPostgresUri(serviceName)),
    });
    return connectPostgres(getPostgresUri(serviceName), { serviceName });
  }

  if (isRailwayRuntime() && !serviceDatabase.mongoUri) {
    throw new Error('DATABASE_PROVIDER resolvido como mongodb no Railway, mas MONGODB_URI não está definida. Configure DATABASE_PROVIDER=postgres e DATABASE_URL=${{Postgres.DATABASE_URL}} no serviço da API.');
  }

  return connectMongo(serviceDatabase.mongoUri || DEFAULT_MONGODB_URI);
};

const maskDatabaseUri = (uri) => {
  try {
    const parsed = new URL(uri);

    if (parsed.password) {
      parsed.password = '***';
    }

    return parsed.toString();
  } catch (err) {
    return uri;
  }
};

module.exports = {
  connectDatabase,
  DEFAULT_MONGODB_URI,
  DEFAULT_POSTGRES_URI,
  maskDatabaseUri,
};
