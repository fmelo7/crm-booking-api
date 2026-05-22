const validate = require('../../middlewares/validate');
const {
  createServiceSchema
} = require('./service.validation');
const express = require('express');
const router = express.Router();
const controller = require('./service.controller');

router.get('/', controller.list);
router.get('/:id', controller.getById);
router.post('/', validate(createServiceSchema), controller.create);
router.put('/:id', validate(createServiceSchema), controller.update);
router.delete('/:id', controller.remove);

module.exports = router;
