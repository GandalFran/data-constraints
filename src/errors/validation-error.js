class ValidationError extends Error {
  constructor(message, violations) {
    super(message);
    this.name = "ValidationError";
    this.violations = violations;
  }
}

module.exports = ValidationError;
