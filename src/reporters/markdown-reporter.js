const BaseReporter = require("./base");
const fs = require("fs");
const _ = require("lodash");
const logger = require("../utils/logger");

class MarkdownReporter extends BaseReporter {
  constructor(outputPath) {
    super();
    this.outputPath = outputPath;
  }

  finish() {
    let md = "# Data Validation Report\n\n";

    if (this.issues.length === 0) {
      md += ":white_check_mark: No issues found.\n";
    } else {
      md += `Found ${this.issues.length} issues.\n\n`;

      const grouped = _.groupBy(this.issues, "id");

      for (const [id, issues] of Object.entries(grouped)) {
        md += `## Constraint: \`${id}\`\n\n`;
        issues.forEach((issue) => {
          md += `- **${issue.type}**: ${issue.message}\n`;
          if (issue.record) {
            md += `  - Record: \`${JSON.stringify(issue.record)}\`\n`;
          }
        });
        md += "\n";
      }
    }

    if (this.outputPath) {
      fs.writeFileSync(this.outputPath, md);
      logger.info(`Markdown report written to ${this.outputPath}`);
    } else {
      // Print report to stdout. Using console.log is correct for data output.
      console.log(md);
    }
  }
}

module.exports = MarkdownReporter;
