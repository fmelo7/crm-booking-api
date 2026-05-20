// src/server.js

require('dotenv').config();

const mongoose = require('mongoose');
const app = require('./app');

const PORT = process.env.PORT || 3000;
const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://127.0.0.1:27017/crm-booking-api';

mongoose.connect(MONGODB_URI)
  .then(() => {
    console.log(`MongoDB conectado em ${MONGODB_URI}`);
    app.listen(PORT, () => {
      console.log(`Server rodando na porta ${PORT}`);
    });
  })
  .catch((err) => {
    console.error('Erro ao conectar ao MongoDB:', err);
    process.exit(1);
  });
