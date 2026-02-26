const logger = require("../utils/logger");
const ExceptionReporter = require("../reporters/exception-reporter");

/**
 * The core engine responsible for managing data sources, constraints,
 * and orchestrating the validation process.
 */
class DataEngine {
  /**
   * @param {object} config - The global configuration object
   */
  constructor(config) {
    this.config = config;
    this.constraints = [];
    this.sources = new Map();
  }

  /**
   * Registers a data source with a name.
   * @param {string} name
   * @param {import('./data-source')} dataSource
   * @param {typeof import('../loaders/stream-loader')} loaderClass
   * @param {object} [loaderOptions]
   */
  addSource(name, dataSource, loaderClass, loaderOptions) {
    this.sources.set(name, { dataSource, loaderClass, loaderOptions });
  }

  /**
   * Adds a constraint to the engine.
   * @param {import('../constraints/base')} constraint
   */
  addConstraint(constraint) {
    this.constraints.push(constraint);
  }

  /**
   * Runs the validation process.
   * @param {import('../reporters/base')} [reporter] - Optional reporter. Defaults to ExceptionReporter.
   */
  async run(reporter) {
    reporter = reporter || new ExceptionReporter();

    // 1. Build Indexes for FK constraints
    logger.info("Building indexes...");
    for (const constraint of this.constraints) {
      if (constraint.type === "foreign-key" && !constraint.isIndexBuilt) {
        const refSourceConfig = this.sources.get(constraint.referenceService);
        if (!refSourceConfig) {
          throw new Error(
            `Reference source "${constraint.referenceService}" not found for FK constraint "${constraint.id}"`,
          );
        }

        const loader = new refSourceConfig.loaderClass(
          refSourceConfig.dataSource,
          refSourceConfig.loaderOptions,
        );
        await constraint.buildIndex(loader.load());
      }
    }

    // 2. Validate Data
    logger.info("Validating data...");
    // Group constraints by source (service)
    const constraintsBySource = this.constraints.reduce((acc, constraint) => {
      const service = constraint.service;
      if (!acc[service]) acc[service] = [];
      acc[service].push(constraint);
      return acc;
    }, {});

    for (const [sourceName, sourceConstraints] of Object.entries(
      constraintsBySource,
    )) {
      const sourceConfig = this.sources.get(sourceName);
      if (!sourceConfig) {
        logger.warn(
          `Source "${sourceName}" not found for constraints. Skipping.`,
        );
        continue;
      }

      const loader = new sourceConfig.loaderClass(
        sourceConfig.dataSource,
        sourceConfig.loaderOptions,
      );
      let index = 0;
      logger.info(`Processing source: ${sourceName}`);
      for await (const record of loader.load()) {
        const context = loader.createContext(record, index++);

        for (const constraint of sourceConstraints) {
          try {
            const result = await constraint.validate(context);
            if (result) {
              reporter.report(result);
            }
          } catch (err) {
            reporter.error(err, context);
          }
        }
      }
    }

    reporter.finish();
  }
}

module.exports = DataEngine;
