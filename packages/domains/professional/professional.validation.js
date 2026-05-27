const { z } = require('zod');

const createProfessionalSchema = z.object({
  name: z.string().min(3),
  category: z.string().min(2),
  phone: z.string().optional().or(z.literal('')),
  email: z.string().email().optional().or(z.literal('')),
  active: z.boolean().optional()
});

const listProfessionalSchema = z.object({
  search: z.string().trim().optional(),
  page: z.coerce.number().int().min(1).optional(),
  limit: z.coerce.number().int().min(1).max(100).optional()
});

module.exports = {
  createProfessionalSchema,
  listProfessionalSchema,
};
