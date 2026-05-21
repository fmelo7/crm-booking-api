// appointment.routes.js

const express = require('express');
const router = express.Router();

const controller = require('./appointment.controller');

router.get('/', controller.list);
router.get('/:id', controller.getById);
router.post('/', controller.create);
router.put('/:id/reschedule', controller.reschedule);
router.delete('/:id/cancel', controller.cancel);

module.exports = router;
