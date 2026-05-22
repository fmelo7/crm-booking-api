// appointment.routes.js
const validate = require('../../middlewares/validate');
const {
  createAppointmentSchema,
  filterAppointmentSchema
} = require('./appointment.validation');
const express = require('express');
const router = express.Router();

const controller = require('./appointment.controller');

router.get('/availability', controller.getAvailability);
router.get('/', validate(filterAppointmentSchema, 'query'), controller.list);
router.get('/:id', validate(filterAppointmentSchema, 'params'), controller.getById);
router.post('/', validate(createAppointmentSchema), controller.create);
router.put('/:id/reschedule', validate(createAppointmentSchema), controller.reschedule);
router.delete('/:id/cancel', validate(filterAppointmentSchema, 'params'), controller.cancel);

module.exports = router;
