const validate = require('../../middlewares/validate');
const {
  createCustomerSchema,
  filterCustomerSchema
} = require('./customer.validation');
const express = require('express');
const router = express.Router();
const controller = require('./customer.controller');

router.get('/', validate(filterCustomerSchema, 'query'), controller.list);
router.get('/:id', validate(filterCustomerSchema, 'params'), controller.getById);
router.post('/', validate(createCustomerSchema), controller.create);
router.put('/:id', validate(createCustomerSchema), controller.update);
router.delete('/:id', validate(filterCustomerSchema, 'params'), controller.remove);

module.exports = router;
