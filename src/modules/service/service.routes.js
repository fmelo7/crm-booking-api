const validate = require('../../middlewares/validate');
const {
  createServiceSchema,
  listServiceSchema
} = require('./service.validation');
const { idParamSchema } = require('../common/validation');
const express = require('express');
const router = express.Router();
const controller = require('./service.controller');

router.get('/', validate(listServiceSchema, 'query'), controller.list);
router.get('/:id', validate(idParamSchema, 'params'), controller.getById);
router.post('/', validate(createServiceSchema), controller.create);
router.put('/:id', validate(idParamSchema, 'params'), validate(createServiceSchema), controller.update);
router.delete('/:id', validate(idParamSchema, 'params'), controller.remove);

module.exports = router;
