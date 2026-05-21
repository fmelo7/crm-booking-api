const { z } = require('zod');

const createCustomerSchema = z.object({
  name: z.string().min(3, 'Name too short'),
  email: z.string().email(),
  phone: z.string().min(8)
});

module.exports = { createCustomerSchema };
