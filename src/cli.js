#!/usr/bin/env node

/**
 * @module data-constraints/cli
 * @description Command-line interface for running the data-constraints validation engine.
 */
const { Command } = require("commander");
const path = require("path");
const { loadConfig } = require("./utils/config-loader");
const DataEngine = require("./core/engine");
const DataSource = require("./core/data-source");
const JsonLoader = require("./loaders/json-loader");
const CsvLoader = require("./loaders/csv-loader");
const registry = require("./core/registry");
// Ensure constraints are registered
require("./constraints");
const ConsoleReporter = require("./reporters/console-reporter");
const JsonReporter = require("./reporters/json-reporter");
const MarkdownReporter = require("./reporters/markdown-reporter");
const logger = require("./utils/logger");

const program = new Command();

program
  .name("data-constraints")
  .description("Validate data against configurable constraints")
  .version("1.0.0");

program
  .command("validate")
  .description("Run validation")
  .requiredOption("-c, --config <path>", "Path to configuration file")
  .option("-d, --data <dir>", "Directory containing data files")
  .option(
    "-f, --format <format>",
    "Output format (console, json, markdown)",
    "console",
  )
  .option("-o, --output <path>", "Output file path")
  .option("--debug", "Enable debug logging")
  .option("--silent", "Disable all logging")
  .action(async (options) => {
    try {
      if (options.silent) {
        logger.setEnabled(false);
      } else if (options.debug) {
        logger.setLevel("DEBUG");
      } else {
        logger.setLevel("INFO");
      }

      const config = loadConfig(options.config);
      const engine = new DataEngine(config);
      const configDir = path.dirname(path.resolve(options.config));

      // 1. Load Sources from Config
      if (config.sources && Array.isArray(config.sources)) {
        for (const source of config.sources) {
          const sourcePath = path.resolve(configDir, source.path);
          let loader;
          let options = {};

          if (source.type === "json") {
            loader = JsonLoader;
            options = { arrayPath: source.arrayPath || config.arrayPath };
          } else if (source.type === "csv") {
            loader = CsvLoader;
            options = { ...source.options };
          }

          if (loader) {
            engine.addSource(
              source.service,
              DataSource.file(sourcePath),
              loader,
              options,
            );
          }
        }
      }

      // 2. Load Sources from Directory (optional override/addition)
      if (options.data) {
        const dataDir = path.resolve(options.data);
        const fs = require("fs");
        if (fs.existsSync(dataDir) && fs.lstatSync(dataDir).isDirectory()) {
          const files = fs.readdirSync(dataDir);
          for (const file of files) {
            const fullPath = path.join(dataDir, file);
            const ext = path.extname(file).toLowerCase();
            const name = path.basename(file, ext);

            // Only add if not already exists? Or overwrite?
            // Let's assume directory scan adds new ones or overwrites.
            if (ext === ".json") {
              engine.addSource(name, DataSource.file(fullPath), JsonLoader, {
                arrayPath: config.arrayPath,
              });
            } else if (ext === ".csv") {
              engine.addSource(name, DataSource.file(fullPath), CsvLoader);
            }
          }
        }
      }

      // Add constraints from config
      let constraints = config.constraints || [];

      // Support external constraints file
      if (typeof constraints === "string") {
        const configDir = path.dirname(path.resolve(options.config));
        const constraintsPath = path.resolve(configDir, constraints);
        const loaded = loadConfig(constraintsPath);
        constraints = loaded.constraints || loaded;
      }

      if (Array.isArray(constraints)) {
        constraints.forEach((c) => engine.addConstraint(registry.create(c)));
      } else if (typeof constraints === "object") {
        for (const type of Object.keys(constraints)) {
          if (Array.isArray(constraints[type])) {
            constraints[type].forEach((c) => {
              if (!c.type) c.type = type;
              engine.addConstraint(registry.create(c));
            });
          }
        }
      }

      // Select Reporter
      let reporter;
      switch (options.format) {
        case "json":
          reporter = new JsonReporter(options.output);
          break;
        case "markdown":
          reporter = new MarkdownReporter(options.output);
          break;
        default:
          reporter = new ConsoleReporter();
      }

      await engine.run(reporter);
    } catch (err) {
      logger.error("Error:", err.message);
      process.exit(1);
    }
  });

if (require.main === module) {
  program.parse();
}

module.exports = { program };
