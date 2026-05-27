const assertFound = (item, message) => {
  if (!item) {
    throw { status: 404, message };
  }

  return item;
};

const assertNoLinkedAppointment = (appointment, message) => {
  if (appointment) {
    throw { status: 409, message };
  }
};

const assertRequiredFields = (data, fields, message) => {
  const hasMissingField = fields.some((field) => !data[field]);

  if (hasMissingField) {
    throw { status: 400, message };
  }
};

module.exports = {
  assertFound,
  assertNoLinkedAppointment,
  assertRequiredFields,
};
