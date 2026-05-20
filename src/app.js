// app.js

const express = require('express');
const app = express();

app.use(express.json());

app.get('/api/health', (req, res) => {
  res.status(200).json({ status: 'ok', uptime: process.uptime(), timestamp: new Date().toISOString() });
});

const appointmentRoutes = require('./modules/appointment/appointment.routes');
const professionalRoutes = require('./modules/professional/professional.routes');
const serviceRoutes = require('./modules/service/service.routes');
const customerRoutes = require('./modules/customer/customer.routes');

app.use('/api/appointments', appointmentRoutes);
app.use('/api/professionals', professionalRoutes);
app.use('/api/services', serviceRoutes);
app.use('/api/customers', customerRoutes);

module.exports = app;