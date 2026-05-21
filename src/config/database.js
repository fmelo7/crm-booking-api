const mongoose = require('mongoose');

const DEFAULT_MONGODB_URI = 'mongodb://127.0.0.1:27017/crm-booking-api';

const connectDatabase = async (uri = process.env.MONGODB_URI || DEFAULT_MONGODB_URI) => {
  await mongoose.connect(uri);
  return uri;
};

module.exports = {
  connectDatabase,
  DEFAULT_MONGODB_URI,
};
