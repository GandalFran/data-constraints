/**
 * @module data-constraints
 * @description The main entry point for the data-constraints package.
 * Exports the core engine, data sources, constraints registry, loaders, and reporters.
 */

const DataEngine = require("./core/engine");
const DataSource = require("./core/data-source");
const registry = require("./core/registry");
const constraints = require("./constraints");

// Loaders
const JsonLoader = require("./loaders/json-loader");
const CsvLoader = require("./loaders/csv-loader");

// Reporters
const ConsoleReporter = require("./reporters/console-reporter");
const JsonReporter = require("./reporters/json-reporter");
const MarkdownReporter = require("./reporters/markdown-reporter");
const ExceptionReporter = require("./reporters/exception-reporter");

// Errors
const ValidationError = require("./errors/validation-error");

module.exports = {
  DataEngine,
  DataSource,
  registry,
  constraints,
  loaders: {
    JsonLoader,
    CsvLoader,
  },
  reporters: {
    ConsoleReporter,
    JsonReporter,
    MarkdownReporter,
    ExceptionReporter,
  },
  errors: {
    ValidationError,
  },
};
