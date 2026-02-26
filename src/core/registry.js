/**
 * Registry mapping constraint type names to their implementation classes.
 * Used for dynamic instantiation of constraints based on configuration.
 */
class ConstraintRegistry {
  constructor() {
    this.types = new Map();
  }

  /**
   * Registers a new constraint class.
   * @param {string} typeName
   * @param {typeof import('../constraints/base')} constraintClass
   */
  register(typeName, constraintClass) {
    this.types.set(typeName, constraintClass);
  }

  /**
   * Creates a constraint instance from a JSON configuration.
   * @param {object} config
   * @returns {import('../constraints/base')}
   */
  create(config) {
    // Normalize type: support camelCase aliases (foreignKey -> foreign-key)
    const type = config.type.replace(/[A-Z]/g, (m) => "-" + m.toLowerCase());

    const TypeClass = this.types.get(type) || this.types.get(config.type);
    if (!TypeClass) {
      throw new Error(`Unknown constraint type: ${config.type}`);
    }
    return TypeClass.fromJSON(config);
  }
}

module.exports = new ConstraintRegistry();
