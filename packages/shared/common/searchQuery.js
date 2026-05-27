const escapeRegExp = (value) => value.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');

const buildSearchQuery = (search, fields) => {
  if (!search) return {};

  const expression = new RegExp(escapeRegExp(search), 'i');

  return {
    $or: fields.map((field) => ({ [field]: expression })),
  };
};

module.exports = {
  buildSearchQuery,
  escapeRegExp,
};
