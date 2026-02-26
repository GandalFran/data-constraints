const ConstraintBase = require("./base");
const Loki = require("lokijs");
const { getValues } = require("../utils/property-accessor");
const {
  generateScenarios,
  interpolateQuery,
  interpolateTemplate,
} = require("../utils/scenario-generator");

/**
 * Constraint that validates foreign key relationships between datasets.
 * Supports a simple single-field check, or an advanced mode using LokiJS queries.
 * @extends {ConstraintBase}
 */
class ForeignKeyConstraint extends ConstraintBase {
  constructor(id, options = {}) {
    super("foreign-key", id);
    this.referenceService = options.referenceService;

    // Simple mode
    this.referenceField = options.referenceField;

    // Advanced mode
    this.variables = options.variables || {}; // map: { "varName": "path.in.record" }
    this.target = options.target || {}; // LokiJS query: { "id": "{{varName}}" }

    this.db = new Loki("references.db");
    this.collection = null;
    this.isIndexBuilt = false;
  }

  setReferenceService(service) {
    this.referenceService = service;
    return this;
  }

  setReferenceField(field) {
    this.referenceField = field;
    return this;
  }

  setVariables(variables) {
    this.variables = variables;
    return this;
  }

  setTarget(target) {
    this.target = target;
    return this;
  }

  setField(field) {
    this.field = field;
    return this;
  }

  toJSON() {
    return {
      ...super.toJSON(),
      referenceService: this.referenceService,
      referenceField: this.referenceField,
      variables: this.variables,
      target: this.target,
    };
  }

  static fromJSON(json) {
    const constraint = new ForeignKeyConstraint(json.id, {
      referenceService: json.referenceService,
      referenceField: json.referenceField,
      variables: json.variables,
      target: json.target,
    });
    constraint.setService(json.service);
    constraint.setField(json.field);
    constraint.setMessage(json.message);
    return constraint;
  }

  /**
   * Builds the index (Loki Collection) from the reference source.
   * @param {AsyncIterable} referenceData
   */
  async buildIndex(referenceData) {
    this.collection = this.db.addCollection("reference");

    // Bulk load if possible, but stream is async iterable
    // Loki is in-memory.
    for await (const record of referenceData) {
      this.collection.insert(record);
    }

    // Ensure simple FK works efficiently if needed, though Loki is fast enough for small/med datasets.
    // If simple mode, we might want an index on referenceField?
    if (this.referenceField) {
      this.collection.ensureIndex(this.referenceField);
    }

    this.isIndexBuilt = true;
  }

  async validate(context) {
    if (!this.isIndexBuilt) {
      throw new Error(`Index for FK constraint "${this.id}" not built.`);
    }

    const { record } = context;

    // Determine Mode
    const isAdvanced = Object.keys(this.variables).length > 0;

    if (!isAdvanced) {
      // BACKWARD COMPATIBILITY: Simple Mode
      // field -> referenceField
      // We can treat this as: variables = { "val": field }, target = { [referenceField]: "{{val}}" }
      // But we must handle Arrays in 'field' correctly (the .every() logic).

      const value = getValues(record, this.field);
      if (value === undefined || value === null) return null;

      const valuesToCheck = Array.isArray(value) ? value : [value];

      for (const val of valuesToCheck) {
        // If simple, we just check existence in collection
        const query = { [this.referenceField]: { $eq: val } };
        const result = this.collection.findOne(query);

        if (!result) {
          let msg = this.message;
          if (msg) {
            const parts = this.field.split(".");
            const key = parts[parts.length - 1];
            msg = interpolateTemplate(msg, { [key]: val, [this.field]: val });
          } else {
            msg = `Foreign key violation: Value "${val}" not found in ${this.referenceService}.${this.referenceField}`;
          }

          return {
            type: "foreign-key",
            id: this.id,
            message: msg,
            record: record,
            context: { service: this.service },
          };
        }
      }
      return null;
    }

    // ADVANCED MODE
    // 1. Identify paths to expand
    const pathsToExpand = Object.values(this.variables);

    // 2. Expand record
    const scenarios = generateScenarios(record, pathsToExpand);

    for (const scenario of scenarios) {
      // 3. Extract variables for this scenario
      // variablesMap: { "userId": "user.id" }
      const queryVars = {};

      for (const [varName, varPath] of Object.entries(this.variables)) {
        // queryEntry/getValues on the expanded scenario
        // Since it's expanded, arrays at path should be single-element arrays (from expandRecord)
        // getValues will return that single element inside array if we ask for it?
        // getValues returns array if array.
        // If generateScenarios made it `[item]`, getValues might return `[item]`.
        // Reference queryEntry logic handles this unwrapping.
        // Let's use getValues and unwrap if array length 1?

        let val = getValues(scenario, varPath);

        if (Array.isArray(val)) {
          if (val.length === 1) val = val[0];
          else if (val.length === 0) val = null;
          // If > 1, it means we didn't expand enough? Or generic array?
        }

        if (val === undefined || val === null) {
          // Variable missing? Usually implies skip or null?
          // If variable is null, and we interpolate, it becomes 'null'.
          // If strict query, maybe we shouldn't query?
          // Reference behavior: includes nulls.
        }
        queryVars[varName] = val;
      }

      // 4. Render Query
      const query = interpolateQuery(this.target, queryVars);

      // 5. Execute Query
      const result = this.collection.findOne(query);

      if (!result) {
        // Construct error message
        let msg = this.message;
        if (!msg) {
          msg = `Foreign key violation: ${JSON.stringify(queryVars)} not found in ${this.referenceService}`;
        } else {
          msg = interpolateTemplate(msg, queryVars);
        }

        return {
          type: "foreign-key",
          id: this.id,
          message: msg,
          record: record, // Original record
          context: { service: this.service, variables: queryVars },
        };
      }
    }

    return null;
  }
}

module.exports = ForeignKeyConstraint;
