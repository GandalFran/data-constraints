/**
 * Base abstract reporter.
 */
class BaseReporter {
  constructor() {
    this.issues = [];
  }

  /**
   * Records an issue.
   * @param {object} issue
   */
  report(issue) {
    this.issues.push(issue);
  }

  /**
   * Records an error (system error, not validation error).
   * @param {Error} error
   * @param {object} _context
   */
  error(error, _context) {
    console.error(error);
  }

  /**
   * Finalizes the report (e.g. writes to file).
   */
  finish() {
    // No-op in base
  }
}

module.exports = BaseReporter;
