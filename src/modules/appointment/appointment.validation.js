const { z } = require('zod');
const { objectId } = require('../common/objectId');

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

const idParamSchema = z.object({
  id: objectId
});

const filterAppointmentSchema = z.object({
  date: z.string().optional(),
  from: z.string().optional(),
  to: z.string().optional(),
  professionalId: objectId.optional(),
  customerId: objectId.optional(),
  status: z.enum(['scheduled', 'cancelled', 'completed']).optional()
});

module.exports = {
  createAppointmentSchema,
  rescheduleAppointmentSchema,
  idParamSchema,
  filterAppointmentSchema
};
