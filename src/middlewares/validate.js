module.exports = (schema, source = 'body') => {
  return (req, res, next) => {
    try {
      const data = req[source];
      const result = schema.safeParse(data);

      if (!result.success) {
        return res.status(400).json({
          error: 'Validation error',
          details: result.error.errors.map(err => ({
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