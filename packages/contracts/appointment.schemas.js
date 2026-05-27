const { z } = require('zod');
const {
  APPOINTMENT_CONTRACT_VERSION,
  AppointmentStatuses,
} = require('./appointment.constants');
const { AppointmentEvents } = require('./appointment.events');

const objectIdSchema = z.string().regex(/^[0-9a-fA-F]{24}$/, 'ID inválido');
const isoDateTimeSchema = z.string().datetime();
const dateOnlySchema = z.string().regex(/^\d{4}-\d{2}-\d{2}$/, 'Data inválida');

const paginationQuerySchema = {
  page: z.coerce.number().int().min(1).optional(),
  limit: z.coerce.number().int().min(1).max(100).optional(),
};

const appointmentIdParamSchema = z.object({
  id: objectIdSchema,
});

const createAppointmentRequestSchema = z.object({
  serviceId: objectIdSchema,
  customerId: objectIdSchema,
  professionalId: objectIdSchema,
  startAt: isoDateTimeSchema,
  notes: z.string().optional(),
});

const rescheduleAppointmentRequestSchema = z.object({
  startAt: isoDateTimeSchema,
  notes: z.string().optional(),
});

const listAppointmentsQuerySchema = z.object({
  date: dateOnlySchema.optional(),
  from: isoDateTimeSchema.optional(),
  to: isoDateTimeSchema.optional(),
  professionalId: objectIdSchema.optional(),
  customerId: objectIdSchema.optional(),
  status: z.enum(AppointmentStatuses).optional(),
  ...paginationQuerySchema,
});

const appointmentAvailabilityQuerySchema = z.object({
  professionalId: objectIdSchema.optional(),
  date: dateOnlySchema.optional(),
  serviceId: objectIdSchema.optional(),
  durationMinutes: z.coerce.number().int().min(1).max(480).optional(),
});

const appointmentResourceSchema = z.object({
  id: objectIdSchema,
  customerId: objectIdSchema,
  serviceId: objectIdSchema,
  professionalId: objectIdSchema,
  startAt: isoDateTimeSchema,
  endAt: isoDateTimeSchema,
  status: z.enum(AppointmentStatuses),
  notes: z.string().optional(),
  createdAt: isoDateTimeSchema.optional(),
  updatedAt: isoDateTimeSchema.optional(),
});

const appointmentEventMetadataSchema = z.object({
  eventId: z.string().min(1),
  eventName: z.enum(Object.values(AppointmentEvents)),
  version: z.literal(APPOINTMENT_CONTRACT_VERSION),
  occurredAt: isoDateTimeSchema,
  correlationId: z.string().min(1).optional(),
});

const appointmentEventDataSchema = z.object({
  appointmentId: objectIdSchema,
  customerId: objectIdSchema,
  serviceId: objectIdSchema,
  professionalId: objectIdSchema,
  startAt: isoDateTimeSchema,
  endAt: isoDateTimeSchema,
  status: z.enum(AppointmentStatuses),
});

const appointmentCreatedEventSchema = appointmentEventMetadataSchema.extend({
  eventName: z.literal(AppointmentEvents.CREATED),
  data: appointmentEventDataSchema,
});

const appointmentRescheduledEventSchema = appointmentEventMetadataSchema.extend({
  eventName: z.literal(AppointmentEvents.RESCHEDULED),
  data: appointmentEventDataSchema.extend({
    previousStartAt: isoDateTimeSchema,
    previousEndAt: isoDateTimeSchema,
  }),
});

const appointmentCancelledEventSchema = appointmentEventMetadataSchema.extend({
  eventName: z.literal(AppointmentEvents.CANCELLED),
  data: appointmentEventDataSchema.extend({
    reason: z.string().optional(),
  }),
});

const appointmentCompletedEventSchema = appointmentEventMetadataSchema.extend({
  eventName: z.literal(AppointmentEvents.COMPLETED),
  data: appointmentEventDataSchema,
});

const appointmentEventSchema = z.discriminatedUnion('eventName', [
  appointmentCreatedEventSchema,
  appointmentRescheduledEventSchema,
  appointmentCancelledEventSchema,
  appointmentCompletedEventSchema,
]);

module.exports = {
  appointmentAvailabilityQuerySchema,
  appointmentCancelledEventSchema,
  appointmentCompletedEventSchema,
  appointmentCreatedEventSchema,
  appointmentEventSchema,
  appointmentIdParamSchema,
  appointmentResourceSchema,
  appointmentRescheduledEventSchema,
  createAppointmentRequestSchema,
  dateOnlySchema,
  isoDateTimeSchema,
  listAppointmentsQuerySchema,
  objectIdSchema,
  rescheduleAppointmentRequestSchema,
};
