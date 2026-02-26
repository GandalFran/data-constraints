const ConstraintBase = require("./base");
const { getValues } = require("../utils/property-accessor");
const { interpolateTemplate } = require("../utils/scenario-generator");

/**
 * Constraint that ensures a specific field's value is not repeated
 * across the entire dataset processed by this constraint instance.
 * @extends {ConstraintBase}
 */
class UniqueConstraint extends ConstraintBase {
  constructor(id) {
    super("unique", id);
    this.field = null;
    // In-memory storage for seen values.
    // For distributed/large-scale, this would need to be an external store (Redis/DB).
    this.seenValues = new Set();
  }

  setField(field) {
    this.field = field;
    return this;
  }

  async validate(context) {
    const { record } = context;
    const value = getValues(record, this.field);

    if (value === undefined || value === null) {
      return null;
    }

    const getMessage = (invalidVal) => {
      if (this.message) {
        const parts = this.field.split(".");
        const key = parts[parts.length - 1];
        return interpolateTemplate(this.message, {
          [key]: invalidVal,
          [this.field]: invalidVal,
        });
      }
      return `Duplicate value "${invalidVal}" found in field "${this.field}"`;
    };

    // Handle arrays (check each item)
    if (Array.isArray(value)) {
      for (const item of value) {
        const itemStr = String(item);
        if (this.seenValues.has(itemStr)) {
          return {
            type: this.type,
            id: this.id,
            message: this.message
              ? getMessage(item)
              : `Duplicate value "${item}" found in array field "${this.field}"`,
            record: record,
          };
        }
        this.seenValues.add(itemStr);
      }
      return null;
    }

    const valueStr = String(value);
    if (this.seenValues.has(valueStr)) {
      return {
        type: this.type,
        id: this.id,
        message: getMessage(value),
        record: record,
      };
    }

    this.seenValues.add(valueStr);
    return null;
  }

  toJSON() {
    return {
      ...super.toJSON(),
      field: this.field,
    };
  }

  static fromJSON(json) {
    const constraint = new UniqueConstraint(json.id);
    constraint.setMessage(json.message);
    constraint.setService(json.service);
    constraint.setField(json.field);
    return constraint;
  }
}

module.exports = UniqueConstraint;
