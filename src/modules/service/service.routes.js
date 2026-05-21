const validate = require('../../middlewares/validate');
const {
  createServiceSchema,
  filterServiceSchema
} = require('./service.validation');
const express = require('express');
const router = express.Router();
const controller = require('./service.controller');

router.get('/', validate(filterServiceSchema, 'query'), controller.list);
router.get('/:id', validate(filterServiceSchema, 'params'), controller.getById);
router.post('/', validate(createServiceSchema), controller.create);
router.put('/:id', validate(createServiceSchema), controller.update);
router.delete('/:id', validate(filterServiceSchema, 'params'), controller.remove);

module.exports = router;
