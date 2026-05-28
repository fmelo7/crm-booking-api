const { z } = require('zod');

const createCustomerSchema = z.object({
  name: z.string().min(3, 'Name too short'),
  email: z.string().email().optional().or(z.literal('')),
  phone: z.string().min(8).optional().or(z.literal('')),
  notes: z.string().optional()
});

const listCustomerSchema = z.object({
  search: z.string().trim().optional(),
  page: z.coerce.number().int().min(1).optional(),
  limit: z.coerce.number().int().min(1).max(100).optional()
});

module.exports = { createCustomerSchema, listCustomerSchema };
