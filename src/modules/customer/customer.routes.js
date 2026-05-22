const validate = require('../../middlewares/validate');
const {
  createCustomerSchema
} = require('./customer.validation');
const express = require('express');
const router = express.Router();
const controller = require('./customer.controller');

router.get('/', controller.list);
router.get('/:id', controller.getById);
router.post('/', validate(createCustomerSchema), controller.create);
router.put('/:id', validate(createCustomerSchema), controller.update);
router.delete('/:id', controller.remove);

module.exports = router;
