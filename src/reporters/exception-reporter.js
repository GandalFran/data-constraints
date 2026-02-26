const ReporterBase = require("./base");
const ValidationError = require("../errors/validation-error");

class ExceptionReporter extends ReporterBase {
  constructor() {
    super();
    this.violations = [];
  }

  report(result) {
    this.violations.push(result);
    super.report(result);
  }

  finish() {
    super.finish();
    if (this.violations.length > 0) {
      throw new ValidationError(
        `Data validation failed with ${this.violations.length} issues.`,
        this.violations,
      );
    }
  }
}

module.exports = ExceptionReporter;
