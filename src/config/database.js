const mongoose = require('mongoose');
const { getDatabaseProvider } = require('../modules/common/databaseProvider');
const { connectPostgres, DEFAULT_POSTGRES_URI, getPostgresUri } = require('./postgres');

const DEFAULT_MONGODB_URI = 'mongodb://127.0.0.1:27017/crm-booking-api';

const connectMongo = async (uri = process.env.MONGODB_URI || DEFAULT_MONGODB_URI) => {
  await mongoose.connect(uri);
  return uri;
};

const connectDatabase = async () => {
  const provider = getDatabaseProvider();

  if (provider === 'postgres') {
    return connectPostgres(getPostgresUri());
  }

  return connectMongo(process.env.MONGODB_URI || DEFAULT_MONGODB_URI);
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
