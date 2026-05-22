module.exports = (schema, source = 'body') => {
  return (req, res, next) => {
    try {
      const data = req[source];
      const result = schema.safeParse(data);

      if (!result.success) {
        const issues = result.error.issues || result.error.errors;

        return res.status(400).json({
          error: 'Validation error',
          details: issues.map(err => ({
            field: err.path.join('.'),
            message: err.message
          }))
        });
      }

      // opcional: sobrescrever com dados parsed
      req[source] = result.data;

      next();
    } catch (err) {
      next(err);
    }
  };
};
