const { z } = require('zod');

const objectId = z.string().regex(/^[0-9a-fA-F]{24}$/, {
  message: 'Invalid ObjectId'
});

module.exports = { objectId };