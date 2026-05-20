// appointment.routes.js

const express = require('express');
const router = express.Router();

const controller = require('./appointment.controller');

router.get('/', controller.list);
router.get('/:id', controller.getById);
router.post('/', controller.create);

module.exports = router;
