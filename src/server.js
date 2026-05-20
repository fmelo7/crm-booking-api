// src/server.js

require('dotenv').config();

const mongoose = require('mongoose');
const app = require('./app');

const PORT = process.env.PORT || 3000;
const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://127.0.0.1:27017/crm-booking-api';

const startServer = () => {
  app.listen(PORT, () => {
    console.log(`Server rodando na porta ${PORT}`);
  });
};

mongoose.connect(MONGODB_URI)
  .then(() => {
    app.set('dbConnected', true);
    console.log(`MongoDB conectado em ${MONGODB_URI}`);
  })
  .catch((err) => {
    app.set('dbConnected', false);
    console.error('Erro ao conectar ao MongoDB:', err);
  })
  .finally(() => {
    startServer();
  });
