const { z } = require('zod');

const createServiceSchema = z.object({
  name: z.string().min(3),
  durationMinutes: z.number().int().min(1).max(480),
  price: z.number().min(0)
});

module.exports = { createServiceSchema };
