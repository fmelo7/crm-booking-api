const validate = require('../../middlewares/validate');
const {
  createCustomerSchema,
  listCustomerSchema
} = require('./customer.validation');
const { idParamSchema } = require('../common/validation');
const express = require('express');
const router = express.Router();
const controller = require('./customer.controller');

router.get('/', validate(listCustomerSchema, 'query'), controller.list);
router.get('/:id', validate(idParamSchema, 'params'), controller.getById);
router.post('/', validate(createCustomerSchema), controller.create);
router.put('/:id', validate(idParamSchema, 'params'), validate(createCustomerSchema), controller.update);
router.delete('/:id', validate(idParamSchema, 'params'), controller.remove);

module.exports = router;
