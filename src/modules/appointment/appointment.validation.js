const { z } = require('zod');
const { objectId } = require('../common/objectId');

const createAppointmentSchema = z.object({
  serviceId: objectId,
  customerId: objectId,
  professionalId: objectId,
  date: z.string().datetime()
});

const filterAppointmentSchema = z.object({
  from: z.string().optional(),
  to: z.string().optional(),
  professionalId: objectId.optional()
});

module.exports = {
  createAppointmentSchema,
  filterAppointmentSchema
};
