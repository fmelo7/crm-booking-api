const Appointment = require('./appointment.model');
const { paginate } = require('../common/pagination');
const { mapAppointment, mapPaginated } = require('../common/repositoryMappers');

exports.create = async (data) => mapAppointment(await Appointment.create(data));

exports.paginate = async (query, options) =>
  mapPaginated(await paginate(Appointment, query, options), mapAppointment);

exports.findById = (id) => Appointment.findById(id);

exports.findByIdPopulated = async (id) =>
  mapAppointment(await Appointment.findById(id).populate('customer service professional'));

exports.findConflict = ({ professionalId, startDate, endDate, excludeId }) => {
  const query = {
    professional: professionalId,
    status: 'scheduled',
    startAt: { $lt: endDate },
    endAt: { $gt: startDate },
  };

  if (excludeId) {
    query._id = { $ne: excludeId };
  }

  return Appointment.findOne(query).then(mapAppointment);
};

exports.findScheduledOverlapping = ({ professionalId, startDate, endDate }) =>
  Appointment.find({
    professional: professionalId,
    status: 'scheduled',
    startAt: { $lt: endDate },
    endAt: { $gt: startDate },
  }).then((appointments) => appointments.map(mapAppointment));

exports.existsForCustomer = (customerId) => Appointment.exists({ customer: customerId });

exports.existsForService = (serviceId) => Appointment.exists({ service: serviceId });

exports.existsForProfessional = (professionalId) => Appointment.exists({ professional: professionalId });
