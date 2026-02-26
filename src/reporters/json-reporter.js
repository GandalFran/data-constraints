const BaseReporter = require("./base");
const fs = require("fs");
const logger = require("../utils/logger");

class JsonReporter extends BaseReporter {
  constructor(outputPath) {
    super();
    this.outputPath = outputPath;
  }

  finish() {
    const output = {
      timestamp: new Date().toISOString(),
      issues: this.issues,
    };

    if (this.outputPath) {
      fs.writeFileSync(this.outputPath, JSON.stringify(output, null, 2));
      logger.info(`Report written to ${this.outputPath}`);
    } else {
      console.log(JSON.stringify(output, null, 2));
    }
  }
}

module.exports = JsonReporter;
