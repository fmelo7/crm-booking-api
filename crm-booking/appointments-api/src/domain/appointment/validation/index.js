const {
  appointmentAvailabilityQuerySchema,
  appointmentIdParamSchema,
  createAppointmentRequestSchema,
  listAppointmentsQuerySchema,
  rescheduleAppointmentRequestSchema,
} = require('../../../contracts');

module.exports = {
  availabilityAppointmentSchema: appointmentAvailabilityQuerySchema,
  createAppointmentSchema: createAppointmentRequestSchema,
  filterAppointmentSchema: listAppointmentsQuerySchema,
  idParamSchema: appointmentIdParamSchema,
  rescheduleAppointmentSchema: rescheduleAppointmentRequestSchema,
};
