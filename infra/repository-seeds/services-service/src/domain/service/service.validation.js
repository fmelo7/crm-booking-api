const { z } = require('zod');

const createServiceSchema = z.object({
  name: z.string().min(3),
  description: z.string().optional(),
  durationMinutes: z.number().int().min(1).max(480),
  price: z.number().min(0)
});

const listServiceSchema = z.object({
  search: z.string().trim().optional(),
  page: z.coerce.number().int().min(1).optional(),
  limit: z.coerce.number().int().min(1).max(100).optional()
});

module.exports = { createServiceSchema, listServiceSchema };
