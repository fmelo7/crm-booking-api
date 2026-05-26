const parseSchema = (schema, data) => {
  const result = schema.safeParse(data);

  if (!result.success) {
    const issues = result.error.issues || result.error.errors;

    throw {
      status: 400,
      code: 'VALIDATION_ERROR',
      message: 'Erro de validação',
      details: issues.map((err) => ({
        field: err.path.join('.'),
        message: err.message,
      })),
    };
  }

  return result.data;
};

module.exports = {
  parseSchema,
};
