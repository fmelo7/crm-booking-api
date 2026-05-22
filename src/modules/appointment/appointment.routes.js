// appointment.routes.js
const validate = require('../../middlewares/validate');
const {
  createAppointmentSchema,
  rescheduleAppointmentSchema,
  idParamSchema,
  filterAppointmentSchema
} = require('./appointment.validation');
const express = require('express');
const router = express.Router();

const controller = require('./appointment.controller');

router.get('/availability', controller.getAvailability);
router.get('/', validate(filterAppointmentSchema, 'query'), controller.list);
router.get('/:id', validate(idParamSchema, 'params'), controller.getById);
router.post('/', validate(createAppointmentSchema), controller.create);
router.put('/:id/reschedule', validate(idParamSchema, 'params'), validate(rescheduleAppointmentSchema), controller.reschedule);
router.patch('/:id/complete', validate(idParamSchema, 'params'), controller.complete);
router.delete('/:id/cancel', validate(idParamSchema, 'params'), controller.cancel);

module.exports = router;
