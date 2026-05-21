// src/server.js

require('dotenv').config();

const app = require('./app');
const { connectDatabase, maskDatabaseUri } = require('./config/database');

const PORT = process.env.PORT || 3000;

const startServer = () => {
  app.listen(PORT, () => {
    console.log(`Server rodando na porta ${PORT}`);
  });
};

connectDatabase()
  .then((uri) => {
    app.set('dbConnected', true);
    console.log(`MongoDB conectado em ${maskDatabaseUri(uri)}`);
  })
  .catch((err) => {
    app.set('dbConnected', false);
    console.error('Erro ao conectar ao MongoDB:', err);
  })
  .finally(() => {
    startServer();
  });
