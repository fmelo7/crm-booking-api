const { z } = require('zod');
const { objectId } = require('./objectId');

const idParamSchema = z.object({
  id: objectId,
});

module.exports = {
  idParamSchema,
};
