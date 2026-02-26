const ConstraintBase = require("./base");
const { getValues } = require("../utils/property-accessor");
const { interpolateTemplate } = require("../utils/scenario-generator");

/**
 * Constraint that validates a string field matches a specified regular expression.
 * @extends {ConstraintBase}
 */
class FormatConstraint extends ConstraintBase {
  constructor(id) {
    super("format", id);
    this.field = null;
    this.regex = null;
  }

  setField(field) {
    this.field = field;
    return this;
  }

  setRegex(regexPattern) {
    this.regex = new RegExp(regexPattern);
    this.regexPattern = regexPattern; // Store string for serialization
    return this;
  }

  async validate(context) {
    const { record } = context;
    const value = getValues(record, this.field);

    if (value === undefined || value === null) {
      return null;
    }

    const check = (val) => this.regex.test(String(val));

    const getMessage = (invalidVal) => {
      if (this.message) {
        // Determine the last part of field path for simple replacement
        const parts = this.field.split(".");
        const key = parts[parts.length - 1];
        return interpolateTemplate(this.message, {
          [key]: invalidVal,
          [this.field]: invalidVal,
        });
      }
      return `Value "${invalidVal}" in field "${this.field}" does not match format "${this.regexPattern}"`;
    };

    if (Array.isArray(value)) {
      const invalidItem = value.find((item) => !check(item));
      if (invalidItem !== undefined) {
        return {
          type: this.type,
          id: this.id,
          message: getMessage(invalidItem),
          record: record,
        };
      }
    } else {
      if (!check(value)) {
        return {
          type: this.type,
          id: this.id,
          message: getMessage(value),
          record: record,
        };
      }
    }

    return null;
  }

  toJSON() {
    return {
      ...super.toJSON(),
      field: this.field,
      regex: this.regexPattern,
    };
  }

  static fromJSON(json) {
    const constraint = new FormatConstraint(json.id);
    constraint.setMessage(json.message);
    constraint.setService(json.service);
    constraint.setField(json.field);
    constraint.setRegex(json.regex);
    return constraint;
  }
}

module.exports = FormatConstraint;
