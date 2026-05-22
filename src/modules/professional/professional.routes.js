const express = require('express');
const validate = require('../../middlewares/validate');
const {
  createProfessionalSchema,
  listProfessionalSchema
} = require('./professional.validation');
const { idParamSchema } = require('../common/validation');
const router = express.Router();
const controller = require('./professional.controller');

router.get('/', validate(listProfessionalSchema, 'query'), controller.list);
router.get('/:id', validate(idParamSchema, 'params'), controller.getById);
router.post('/', validate(createProfessionalSchema), controller.create);
router.put('/:id', validate(idParamSchema, 'params'), validate(createProfessionalSchema), controller.update);
router.delete('/:id', validate(idParamSchema, 'params'), controller.remove);

module.exports = router;
