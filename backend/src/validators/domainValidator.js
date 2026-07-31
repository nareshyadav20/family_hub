const validateRequest = (schema) => {
  return (req, res, next) => {
    try {
      const parsed = schema.parse(req.body);
      req.validatedData = parsed;
      next();
    } catch (err) {
      if (err.errors) {
        const formattedErrors = err.errors.map(e => ({
          field: e.path.join('.'),
          message: e.message
        }));
        return res.status(400).json({
          success: false,
          message: 'Validation failed',
          data: null,
          errors: formattedErrors
        });
      }
      return res.status(400).json({
        success: false,
        message: 'Invalid input parameters',
        data: null,
        errors: [err.message]
      });
    }
  };
};

module.exports = {
  validateRequest
};
