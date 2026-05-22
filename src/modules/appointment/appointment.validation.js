const { z } = require('zod');
const { objectId } = require('../common/objectId');
const { idParamSchema } = require('../common/validation');

const paginationSchema = {
  page: z.coerce.number().int().min(1).optional(),
  limit: z.coerce.number().int().min(1).max(100).optional()
};

const createAppointmentSchema = z.object({
  serviceId: objectId,
  customerId: objectId,
  professionalId: objectId,
  startAt: z.string().datetime(),
  notes: z.string().optional()
});

const rescheduleAppointmentSchema = z.object({
  startAt: z.string().datetime(),
  notes: z.string().optional()
});

const filterAppointmentSchema = z.object({
  date: z.string().optional(),
  from: z.string().optional(),
  to: z.string().optional(),
  professionalId: objectId.optional(),
  customerId: objectId.optional(),
  status: z.enum(['scheduled', 'cancelled', 'completed']).optional(),
  ...paginationSchema
});

module.exports = {
  createAppointmentSchema,
  rescheduleAppointmentSchema,
  idParamSchema,
  filterAppointmentSchema
};
