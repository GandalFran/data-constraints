/**
 * Base class for all data constraints.
 * Supports serialization (toJSON/fromJSON) and builder pattern.
 */
class ConstraintBase {
  constructor(type, id) {
    this.type = type;
    this.id = id;
    this.message = null; // Custom error message template
    this.service = null; // Target service/source name
  }

  /**
   * Sets a custom error message template.
   * @param {string} message
   */
  setMessage(message) {
    this.message = message;
    return this;
  }

  setService(service) {
    this.service = service;
    return this;
  }

  /**
   * Serializes the constraint to a plain JSON object.
   * @returns {object}
   */
  toJSON() {
    return {
      type: this.type,
      id: this.id,
      message: this.message,
      service: this.service,
    };
  }

  /**
   * Validates a record.
   * @param {object} _context - { record, index, ... }
   * @returns {Promise<object|null>} Error object or null if valid.
   */
  async validate(_context) {
    throw new Error("Method validate() must be implemented");
  }

  /**
   * Reconstructs a constraint from a JSON object.
   * Must be implemented by subclasses if they have specific properties.
   * @param {object} _json
   */
  static fromJSON(_json) {
    throw new Error(
      "Method fromJSON() must be implemented by concrete classes",
    );
  }
}

module.exports = ConstraintBase;
