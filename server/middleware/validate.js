const validate = (schema) => {
  return (req, res, next) => {
    const { error } = schema.validate(req.body, { abortEarly: false, stripUnknown: true });
    if (error) {
      const messages = error.details.map(detail => detail.message);
      return res.status(400).json({ success: false, message: messages.join(', ') });
    }
    next();
  };
};

module.exports = { validate };
