const BaseReporter = require("./base");
const chalk = require("chalk");
const logger = require("../utils/logger");

class ConsoleReporter extends BaseReporter {
  report(issue) {
    super.report(issue);
    // Report individual issues to stdout as they happen?
    // Or maybe use logger?
    // If we use logger.error/warn, they might be suppressed by level, which is good.
    // But ConsoleReporter implies "I want to see the report on console".
    // Let's use console.log explicitly for the report content,
    // but maybe allow silencing via a flag in the reporter itself if needed.
    // For now, sticking to console.log for the report *content*.
    console.log(
      chalk.red(`[${issue.id}]`),
      chalk.yellow(`(${issue.type})`),
      issue.message,
    );
  }

  finish() {
    // Summary is info/metadata.
    logger.info(`\nValidation finished. Found ${this.issues.length} issues.`);
  }
}

module.exports = ConsoleReporter;
